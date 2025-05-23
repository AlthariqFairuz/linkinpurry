import { Hono } from 'hono';
import type { Context } from 'hono';
import { getCookie, setCookie } from 'hono/cookie'
import bcryptjs from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { prisma } from '../db/connections.js';
import { uploadToCloudinary } from '../utils/cloudinary.js';
import type { JWTPayload } from '../types/JWTPayload.js';
import webPush from 'web-push';

const auth = new Hono();

// buat vapid
const VAPID_PUBLIC_KEY = process.env.VAPID_PUBLIC || '';
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE || '';
webPush.setVapidDetails(
  'mailto:yuruyunaath@gmail.com',
  VAPID_PUBLIC_KEY,
  VAPID_PRIVATE_KEY
);

// Helper function to generate JWT with exactly 1 hour TTL
const generateToken = (user: { id: bigint; email: string; username: string; fullName: string | null }) => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET is not defined in environment variables');
  }

  return jwt.sign(
    {
      userId: user.id.toString(),
      email: user.email,
      username: user.username,
      fullName: user.fullName,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 3600, 
    },
    secret
  );
};

// Helper function to set cookie with 1 hour TTL
const setTokenCookie = (c: Context, token: string) => {
  setCookie(c, 'token', token, {
    httpOnly: true,
    secure: true, 
    sameSite: 'lax',
    maxAge: 3600,  
    path: '/'
  });
};

// Helper function to clear JWT cookie
const removeTokenCookie = (c: Context) => {
  setCookie(c, 'token', '', {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    maxAge: 0,
    path: '/'
  });
};

// Verify JWT token from cookie
export const verifyToken = (token: string): Promise<JWTPayload> => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET is not defined');
  }
  
  return new Promise((resolve, reject) => {
    jwt.verify(token, secret, (err, decoded) => {
      if (err) reject(err);
      if (!decoded || typeof decoded === 'string') {
        reject(new Error('Invalid token payload'));
      } else {
        resolve(decoded as JWTPayload);
      }
    });
  });
};

const registerSchema = z.object({
  username: z
    .string()
    .min(3, 'Username must be at least 3 characters')
    .max(255, 'Username must not exceed 255 characters')
    .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores'),
  
  fullName: z
    .string()
    .max(255, 'Full name must not exceed 50 characters')
    .optional(),
  
  email: z
    .string()
    .email('Invalid email format')
    .max(255, 'Email must not exceed 255 characters'),
  
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(100, 'Password must not exceed 100 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
  
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, { // refine for custom validation
  message: "Passwords don't match",
  path: ["confirmPassword"], 
});

const updateProfileSchema = z.object({
  username: z
    .string()
    .min(3, 'Username must be at least 3 characters')
    .max(255, 'Username must not exceed 255 characters')
    .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores'),
  
  fullName: z
    .string()
    .max(255, 'Full name must not exceed 255 characters')
    .optional()
    .nullable(),
  
  skills: z
    .string()
    .optional()
    .nullable(),
  
  workHistory: z
    .string()
    .optional()
    .nullable(),
});

// Add verify endpoint
auth.get('/verify', async (c : Context) => {
  try {
    const token = getCookie(c, 'token');
    
    if (!token) {
      return c.json({ success: false, 
        message: 'No token found', 
        body: null 
      }, 401);
    }

    const decoded = await verifyToken(token);
    
    // Check if token is expired
    if (decoded.exp * 1000 < Date.now()) {
      removeTokenCookie(c);
      return c.json({ 
        success: false, 
        message: 'Token expired', 
        body: null 
      }, 401);
    }

    return c.json({
      success: true,
      message: 'Token verified',
      body: {
        token,
        id: decoded.userId,
        email: decoded.email,
        username: decoded.username,
        fullName: decoded.fullName
      }
    }, 200);
  } catch (error) {
    removeTokenCookie(c);
    return c.json({ 
      success: false, 
      message: 'Invalid token', 
      body: null 
    }, 401);
  }
});

auth.post('/logout', (c) => {
  removeTokenCookie(c);
  return c.json({ 
    success: true, 
    message: 'Logged out successfully', 
    body: null 
  }, 200);
});

auth.post('/register', async (c : Context) => {
  try {
    const body = await c.req.json();

    const result = registerSchema.safeParse(body);

    if (!result.success) {
      const errorMessages = result.error.errors.map(err => ({
        field: err.path.join('.'),
        message: err.message
      }));

      return c.json({ 
        success: false, 
        message: 'Validation failed',
        body: errorMessages
      }, 400);
    }

    const validatedData = result.data;
    
    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: { 
        OR: [
          { email: validatedData.email }, 
          { username: validatedData.username }
        ] 
      }
    });

    if (existingUser) {
      return c.json({ 
        success: false, 
        message: 'User already exists', 
        body: null 
      }, 400);
    }

     // Hash password with bcrypt
     const hashedPassword = await bcryptjs.hash(validatedData.password, 10);

     // Create new user
     await prisma.user.create({
       data: {
         username: validatedData.username,
         fullName: validatedData.fullName || 'LinkInPurry Member',
         email: validatedData.email,
         passwordHash: hashedPassword,
         profilePhotoPath: '/images/default.webp'
       }
     });
 
     return c.json({
       success: true,
       message: "Registration Successful",
       body: null
     }, 200);
   } catch (error) {
     return c.json({ 
       success: false, 
       message: 'Registration failed ' + error, 
       body: null 
     }, 500);
   }
 });

 auth.post('/login', async (c : Context) => {
  try {
    const { identifier, password } = await c.req.json();

    // Validate input
    if (!identifier || !password) {
      return c.json({ 
        success: false, 
        message: 'Identifier and Password are required',
        body: null 
      }, 400);
    }

    const user = await prisma.user.findFirst({ 
      where: {
      OR: [{ email: identifier },
        { username: identifier }
      ]
    }
    });

    if (!user) {
      return c.json({ 
        success: false, 
        message: 'Invalid credentials',
        body: null 
      }, 401);
    }

    const isValid = await bcryptjs.compare(password, user.passwordHash);
    if (!isValid) {
      return c.json({ 
        success: false, 
        message: 'Invalid credentials',
        body: null 
      }, 401);
    }

    const token = generateToken(user);
    setTokenCookie(c, token);

    return c.json({
      success: true,
      message: `Welcome back, ${user.username}!`,
      body: {
        token
      }
    }, 200);
  } catch (error) {
    console.error('Login error:', error);
    return c.json({ 
      success: false, 
      message: 'An error occurred during login. Please try again.', 
      body: null 
    }, 500);
  }
});

auth.get('/profile/:id', async (c: Context) => {
  try {
    const userId = BigInt(c.req.param('id'));

    const user = await prisma.user.findUnique({ 
      where: { id: userId }
    });

    if (!user) {
      return c.json({ 
        success: false, 
        message: 'Invalid user',
        body: null 
      }, 401);
    }

    const numberOfConnections = await prisma.connection.count({
      where: {
        fromId: userId
      }
    });

    const token = getCookie(c, 'token');

    // public access (no token)
    if (!token) {
      return c.json({
        success: true,
        message: 'Public Profile',
        body: {
          username: user.username,
          fullName: user.fullName,
          skills: user.skills,
          workHistory: user.workHistory,
          profilePhotoPath: user.profilePhotoPath,
          connections: numberOfConnections,
          latestPost: null
        }
      }, 200);
    }
    
    // authenticated users, fetch the latest post
    const decoded = await verifyToken(token);
    const decodedUserId = BigInt(decoded.userId);
    
    // Fetch latest post
    const latestPost = await prisma.feed.findFirst({
      where: {
        userId
      },
      orderBy: {
        createdAt: "desc"
      },
      include: {
        user: {
          select: {
            fullName: true,
            profilePhotoPath: true
          }
        }
      }
    });

    // Serialize the latest post if it exists
    const serializedPost = latestPost ? {
      id: latestPost.id.toString(),
      userId: latestPost.userId.toString(),
      content: latestPost.content,
      createdAt: latestPost.createdAt.toISOString(),
      updatedAt: latestPost.updatedAt.toISOString(),
      user: {
        fullName: latestPost.user.fullName,
        profilePhotoPath: latestPost.user.profilePhotoPath
      }
    } : null;

    if (decodedUserId === userId) {
      return c.json({
        success: true,
        message: 'Self Profile',
        body: {
          id: user.id.toString(),
          username: user.username,
          fullName: user.fullName,
          email: user.email,
          skills: user.skills,
          workHistory: user.workHistory,
          profilePhotoPath: user.profilePhotoPath,
          connections: numberOfConnections,
          latestPost: serializedPost
        }
      }, 200);
    }
    
    return c.json({
      success: true,
      message: 'Public Profile',
      body: {
        id: user.id.toString(),
        username: user.username,
        fullName: user.fullName,
        skills: user.skills,
        workHistory: user.workHistory,
        profilePhotoPath: user.profilePhotoPath,
        connections: numberOfConnections,
        latestPost: serializedPost
      }
    }, 200);

  } catch (error) {
    removeTokenCookie(c);
    return c.json({ 
      success: false, 
      message: 'Invalid token', 
      body: null
    }, 401);
  }
});

auth.put('/profile/:id', async (c: Context) => {
  try {
    const token = getCookie(c, 'token');
    if (!token) {
      return c.json({ 
        success: false, 
        message: 'No token found', 
        body: null 
      }, 401);
    }

    const decoded = await verifyToken(token);
    const userId = BigInt(decoded.userId);

    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      return c.json({ 
        success: false, 
        message: 'Invalid user',
        body: null 
      }, 401);
    }

    // Parse form data
    const formData = await c.req.formData();
    const data = {
      username: formData.get('username'),
      fullName: formData.get('fullName'),
      skills: formData.get('skills'),
      workHistory: formData.get('workHistory'),
    };

    // Validate the data
    const result = updateProfileSchema.safeParse(data);
    if (!result.success) {
      const errorMessages = result.error.errors.map(err => ({
        field: err.path.join('.'),
        message: err.message
      }));

      return c.json({ 
        success: false, 
        message: 'Validation failed',
        body: errorMessages
      }, 400);
    }

    const validatedData = result.data;

    // Check for existing username
    const existingUser = await prisma.user.findFirst({
      where: { 
        username: validatedData.username,
        id: { not: userId }
      } 
    });

    if (existingUser) {
      return c.json({ 
        success: false, 
        message: 'Username already exists',
        body: null 
      }, 400);
    }

    // Handle photo upload if provided
    const photo = formData.get('photo') as File | null;
    let profilePhotoPath = user.profilePhotoPath;
    
    if (photo) {
      const arrayBuffer = await photo.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const fileObject = {
        buffer,
        mimetype: photo.type,
      };
      profilePhotoPath = await uploadToCloudinary(fileObject);
    }

    // Update user with validated data
    await prisma.user.update({
      where: { id: userId },
      data: {
        ...validatedData,
        profilePhotoPath
      }
    });

    return c.json({
      success: true,
      message: 'Update successful',
      body: null
    }, 200);

  } catch (error) {
    return c.json({ 
      success: false, 
      message: 'Update failed: ' + error, 
      body: null 
    }, 500);
  }
});

auth.get('/connections/:userId', async (c: Context) => {
  try {
    const userId = BigInt(c.req.param('userId'));
    
    const connections = await prisma.connection.findMany({
      where: {
        fromId: userId
      },
      include: {
        to: {
          select: {
            id: true,
            fullName: true,
            username: true,
            profilePhotoPath: true,
            skills: true,
            workHistory: true
          }
        }
      }
    });

    return c.json({
      success: true,
      message: 'List of connections retrieved successfully',
      body: {
        connections: connections.map(conn => ({
          ...conn.to,
          id: conn.to.id.toString()
        }))
      }
    }, 200);
  } catch (error) {
    return c.json({
      success: false,
      message: 'Failed to retrieve connections',
      body: null
    }, 500);
  }
});

auth.get('/users/search', async (c : Context) => {
  try {

    const { q } = c.req.query();

    //case insensitive search pake mode insensitive
    const users = await prisma.user.findMany({
      where: {
        OR: [
          {
            username: {
              contains: q,
              mode: 'insensitive'
            }
          },
          {
            fullName: {
              contains: q,
              mode: 'insensitive'
            }
          }
        ], 
      },
      select: {
        id: true,
        username: true,
        fullName: true,
        profilePhotoPath: true
      },
      take: 10
    });

    return c.json({
      success: true,
      message: 'Search results retrieved successfully',
      body: {
        users: users.map(user => ({
          ...user,
          id: user.id.toString() // convert bigint to string or else it will be an error
        }))
      }
    }, 200);

  } catch (error) {
    console.error('Search error:', error);
    return c.json({
      success: false,
      message: 'Failed to perform search',
      body: null
    }, 500);
  }
});

auth.get('/connection-status/:id', async (c : Context) => {
  try {
    const toId = BigInt(c.req.param('id'));

    const token = getCookie(c, 'token');

    if (!token) {
      return c.json({ 
        success: false, 
        message: 'No token found', 
        body: null 
      }, 401);
    }
    
    const user = await prisma.user.findUnique({ 
      where: { id: toId }
    });

    if (!user) {
      return c.json({ 
        success: false, 
        message: 'Invalid user',
        body: null 
      }, 401);
    }

    const decoded = await verifyToken(token);
    const decodedUserId = BigInt(decoded.userId);

    if (decodedUserId == toId) {
      return c.json({
        success: true,
        message: 'Self connection',
        body: {
          connected: true
        }
      }, 200);
    }

    const connection = await prisma.connection.findFirst({ 
      where: {
        OR: [
          {
            fromId: decodedUserId,
            toId: toId
          },
          {
            toId: decodedUserId,
            fromId: toId
          }
        ]
      }
    });

    return c.json({
      success: true,
      message: 'Connection-status: ' + (connection !== null ? 'connected' : 'unconnected'),
      body: {
        connected: connection !== null
      }
    }, 200);

  } catch (error) {
    removeTokenCookie(c);
    return c.json({ 
      success: false, 
      message: 'Failed to retrieve connection status: ' + error, 
      body: null
    }, 401);
  }
});

auth.get('/network/all-users', async (c : Context) => {
  try {

    const token = getCookie(c, 'token');
    if (!token) return c.json({ 
      success: false, 
      message: 'No token found', 
      body: null 
    }, 401);

    const decoded = await verifyToken(token);
    const userId = BigInt(decoded.userId);

    const users = await prisma.user.findMany({
      where: {
        id: { not: userId }
      },
      orderBy: {
        id: 'asc'
      },
      select: {
        id: true,
        fullName: true,
        username: true,
        skills: true,
        workHistory: true,
        profilePhotoPath: true
      }
    });

    return c.json({
      success: true,
      message: 'All users retrieved successfully',
      body: {
        connection: users.map(user => ({
          id: user.id.toString(),
          fullName: user.fullName,
          username: user.username,
          skills: user.skills,
          workHistory: user.workHistory,
          profilePhotoPath: user.profilePhotoPath
        }))
      }
    }, 200);
  } catch (error) {
    return c.json({
      success: false,
      message: 'Failed to retrieve all users: ' + error,
      body: null
    }, 500);
  }
});

auth.get('/network/unconnected', async (c : Context) => {
  try {
    const token = getCookie(c, 'token');
    if (!token) return c.json({ 
      success: false, 
      message: 'No token found', 
      body: null 
    }, 401);
    
    const decoded = await verifyToken(token);
    const userId = BigInt(decoded.userId);

const users = await prisma.user.findMany({ 
  where: {
    AND: [
      { id: { not: userId } },  // Not the current user
      {
        NOT: {
          OR: [
            // current user Belum mengirim request ke user X
            { receivedRequests: { some: { fromId: userId } } },
            // user X Belum menerima request dari current user
            { sentRequests: { some: { toId: userId } } },
            // current user Belum terhubung dengan user X
            { receivedConnections: { some: { fromId: userId } } },
            // user X Belum terhubung dengan current user
            { sentConnections: { some: { toId: userId } } }
          ]
        }
      }
    ]
  },
  select: {
    id: true,
    fullName: true,
    username: true,
    skills: true,
    workHistory: true,
    profilePhotoPath: true,
  }
});

    return c.json({
      success: true,
      message: 'Connection-status: unconnected',
      body: {
        connection: users.map(user => ({
          id: user.id.toString(),
          fullName: user.fullName,
          username: user.username,
          skills: user.skills,
          workHistory: user.workHistory,
          profilePhotoPath: user.profilePhotoPath
        }))
      }
    }, 200);

  } catch (error) {
    removeTokenCookie(c);
    return c.json({ 
      success: false, 
      message: 'Failed to retrieve connection status: ' + error, 
      body: error 
    }, 401);
  }
});

auth.get('/network/requested', async (c : Context) => {
  try {
    const token = getCookie(c, 'token');
    if (!token) return c.json({ 
      success: false, 
      message: 'No token found', 
      body: null 
    }, 401);
    
    const decoded = await verifyToken(token);
    const userId = BigInt(decoded.userId);

    const users = await prisma.user.findMany({ 
      where: {
        AND: [
          { 
            receivedRequests: { 
              some: { 
                fromId: userId 
              } 
            } 
          },
          {
            NOT: {
              // current user Belum terhubung dengan user X secara timbal balik
              OR: [
                { receivedConnections: { some: { fromId: userId } } },
                { sentConnections: { some: { toId: userId } } }
              ]
            }
          }
        ]
      },
      select: {
        id: true,
        fullName: true,
        username: true,
        skills: true,
        workHistory: true,
        profilePhotoPath: true,
      }
    });

    return c.json({
      success: true,
      message: 'Connection-status: requested',
      body: {
        connection: users.map(user => ({
          id: user.id.toString(),
          fullName: user.fullName,
          username: user.username,
          skills: user.skills,
          workHistory: user.workHistory,
          profilePhotoPath: user.profilePhotoPath
        }))
      }
    }, 200);

  } catch (error) {
    removeTokenCookie(c);
    return c.json({ 
      success: false, 
      message: 'Failed to retrieve connection status: ' + error, 
      body: null 
    }, 401);
  }
});

auth.get('/network/incoming-requests', async (c : Context) => { 
  try {
    const token = getCookie(c, 'token');
    if (!token) return c.json({ 
      success: false, 
      message: 'No token found', 
      body: null 
    }, 401);
    
    const decoded = await verifyToken(token);
    const userId = BigInt(decoded.userId);

   const requests = await prisma.connectionRequest.findMany({
      where: {
        toId: userId,
        NOT: {
          // sama juga, current user Belum terhubung dengan user X secara timbal balik
          OR: [
            { from: { receivedConnections: { some: { fromId: userId } } } },
            { from: { sentConnections: { some: { toId: userId } } } }
          ]
        }
      },
      include: {
        from: true // join dengan table user
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return c.json({
      success: true,
      message: 'Incoming requests retrieved successfully',
      body: {
        connection: requests.map(request => ({
          id: request.from.id.toString(),
          fullName: request.from.fullName,
          username: request.from.username,
          skills: request.from.skills,
          workHistory: request.from.workHistory,
          profilePhotoPath: request.from.profilePhotoPath,
        }))
      }
    }, 200);

  } catch (error) {
    removeTokenCookie(c);
    return c.json({ 
      success: false, 
      message: 'Failed to retrieve connection status: ' + error, 
      body: null 
    }, 401);
  }
});

auth.get('/network/connected', async (c : Context) => {
  try {
    const token = getCookie(c, 'token');

    if (!token) return c.json({ 
      success: false, 
      message: 'No token found', 
      body: null 
    }, 401);
    
    const decoded = await verifyToken(token);
    const userId = BigInt(decoded.userId);

    const users = await prisma.user.findMany({ 
      where: {
        id: { not: userId },
        OR: [
          // cek connected (current user terhubung dengan user X)
          { receivedConnections: { some: { fromId: userId } } },
          // cek connected (current user X dengan current user)
          { sentConnections: { some: { toId: userId } } }
        ]
      },
      select: {
        id: true,
        fullName: true,
        username: true,
        skills: true,
        workHistory: true,
        profilePhotoPath: true,
      }
    });

    return c.json({
      success: true,
      message: 'Connection-status: connected',
      body: {
        connection: users.map(user => ({
          id: user.id.toString(),
          fullName: user.fullName,
          username: user.username,
          skills: user.skills,
          workHistory: user.workHistory,
          profilePhotoPath: user.profilePhotoPath
        }))
      }
    }, 200);

  } catch (error) {
    removeTokenCookie(c);
    return c.json({ 
      success: false, 
      message: 'Invalid token', 
      body: null
    }, 401);
  }
});

auth.post('/request/:id', async (c : Context) => {
  try {
    const token = getCookie(c, 'token');
    if (!token) return c.json({ 
      success: false, 
      message: 'No token found', 
      body: null 
    }, 401);

    const decoded = await verifyToken(token);
    const fromId = BigInt(decoded.userId);
    const toId = BigInt(c.req.param('id'));

    if (fromId === toId) {
      return c.json({
        success: false,
        message: 'Cannot connect to yourself',
        body: null
      }, 400);
    }

    // cek apakah user X ada dan apakah sudah requested/connected
    const [targetUser, existingRequest, existingRequest2, existingConnection] = await Promise.all([
      prisma.user.findUnique({ where: { id: toId } }), // cek apakah user X ada
      prisma.connectionRequest.findFirst({  
        where: { fromId, toId }
      }), // cek apakah current user sudah mengirim request ke user X
      prisma.connectionRequest.findFirst({
        where: { fromId: toId, toId: fromId }
      }), // cek apakah user X sudah mengirim request ke current user
      prisma.connection.findFirst({ 
        where: { 
          // cek apakah current user sudah terhubung dengan user X
          OR: [
            { fromId, toId },
            { fromId: toId, toId: fromId }
          ]
        }
      }) 
    ]);

    if (!targetUser) {
      return c.json({ 
        success: false, 
        message: 'Invalid user',
        body: null 
      }, 401);
    }

    if (existingRequest || existingRequest2 || existingConnection) {
      return c.json({
        success: false,
        message: 'Already requested or connected',
        body: null
      }, 400);
    }

    // bikin request baru
    await prisma.connectionRequest.create({
      data: {
        fromId,
        toId,
        createdAt: new Date()
      }
    });

    return c.json({
      success: true,
      message: "Request Successful",
      body: null
    }, 200);

  } catch (error) {
    removeTokenCookie(c);
    return c.json({ 
      success: false, 
      message: 'Failed to send request: ' + error, 
      body: null
    }, 401);
  }
});

auth.post('/accept-request/:id', async (c) => {
  try {
    const token = getCookie(c, 'token');
    if (!token) return c.json({ 
      success: false, 
      message: 'No token found', 
      body: null 
    }, 401);
    
    const decoded = await verifyToken(token);
    const toId = BigInt(decoded.userId);
    const fromId = BigInt(c.req.param('id'));

    // cek apakah request ada
    const request = await prisma.connectionRequest.findFirst({
      where: { fromId, toId }
    });

    if (!request) {
      return c.json({ 
        success: false, 
        message: 'Request not found', 
        body: null 
      }, 400);
    }

    // bikin connection dan delete request dalam transaction
    await prisma.$transaction([
      // Create connection from requester to accepter
      prisma.connection.create({
        data: { fromId, toId, createdAt: new Date() }
      }),
      // Create mutual connection from accepter to requester
      prisma.connection.create({
        data: { fromId: toId, toId: fromId, createdAt: new Date() }
      }),
      // Delete any connection requests in either direction
      prisma.connectionRequest.delete({
        where: {
          fromId_toId: { fromId, toId }
        }
      }),
    ]);

    return c.json({ 
      success: true, 
      message: 'Connection accepted', 
      body: null 
    }, 200);
  } catch (error) {
    removeTokenCookie(c);
    return c.json({ 
      success: false, 
      message: 'Failed to accept request: ' + error, 
      body: null 
    }, 500);
  }
});

// Decline connection request
auth.post('/decline-request/:id', async (c : Context) => {
  try {
    const token = getCookie(c, 'token');
    if (!token) return c.json({ 
      success: false, 
      message: 'No token found', 
      body: null 
    }, 401);
    
    const decoded = await verifyToken(token);
    const toId = BigInt(decoded.userId);
    const fromId = BigInt(c.req.param('id'));

    // Delete request
    await prisma.connectionRequest.delete({
      where: { fromId_toId: { fromId, toId } }
    });

    return c.json({ 
      success: true, 
      message: 'Request declined', 
      body: null 
    }, 200);
  } catch (error) {
    removeTokenCookie(c); 
    return c.json({ 
      success : false, 
      message: 'Failed to decline request: ' + error, 
      body: null 
    }, 500);
  }
});

auth.post('/disconnect/:id', async (c : Context) => {
  try {
    const token = getCookie(c, 'token');
    if (!token) {
      return c.json({ 
        success: false, 
        message: 'No token found', 
        body: null 
      }, 401);
    }

    const decoded = await verifyToken(token);
    const fromId = BigInt(decoded.userId);
    const toId = BigInt(c.req.param('id'));

    // Check if connection exists (in either direction since connections are bidirectional)
    const existingConnection = await prisma.connection.findFirst({
      where: {
        OR: [
          { fromId, toId },
          { fromId: toId, toId: fromId }
        ]
      }
    });

    if (!existingConnection) {
      return c.json({
        success: false,
        message: 'Connection not found',
        body: null
      }, 404);
    }

    // Delete the connection
    await prisma.$transaction([
      prisma.connection.deleteMany({
        where: {
          OR: [
          { fromId, toId },
          { fromId: toId, toId: fromId }
        ]
        }
      }),
      // delete any chat in either direction
      prisma.chat.deleteMany({
        where: {
          OR: [
            { fromId, toId },
            { fromId: toId, toId: fromId }
          ]
        }
      })
    ]);

    return c.json({
      success: true,
      message: 'Connection removed successfully',
      body: null
    }, 200);

  } catch (error) {
    console.error('Remove connection error:', error);
    return c.json({ 
      success: false, 
      message: 'Failed to remove connection: ' + error  , 
      body: null 
    }, 500);
  }
});

auth.get('/chat/history/:userId', async (c : Context) => {
  try {
    const userId = BigInt(c.req.param('userId'));
    const token = getCookie(c, 'token');
    
    if (!token) {
      return c.json({ 
        success: false, 
        message: 'Unauthorized', 
        body: null 
      }, 401);
    }

    const decoded = await verifyToken(token);
    const currentUserId = BigInt(decoded.userId);

    const messages = await prisma.chat.findMany({
      where: {
        OR: [
          { fromId: currentUserId, toId: userId },
          { fromId: userId, toId: currentUserId }
        ]
      },
      orderBy: {
        timestamp: 'asc'
      }
    });

    return c.json({
      success: true,
      message: 'Chat history retrieved successfully',
      body: {
        messages: messages.map(msg => ({
          ...msg,
          id: msg.id.toString(),
          fromId: msg.fromId.toString(),
          toId: msg.toId.toString(),
          timestamp: msg.timestamp.toISOString() 
        }))
      }
    }, 200);
  } catch (error) {
    return c.json({ 
      success: false, 
      message: 'Failed to fetch chat history: ' + error, 
      body: null 
    }, 500);
  }
});

auth.get('/feed', async (c) => {
  try {
    const token = getCookie(c, "token");
    if (!token) return c.json({ 
      success: false, 
      message: 'No token found', 
      body: null 
    }, 401);
    
    const decoded = await verifyToken(token);
    const currentUserId = BigInt(decoded.userId);

    // get connected users
    const connections = await prisma.connection.findMany({
      where: {
        fromId: currentUserId
      },
      select: {
        toId: true
      }
    });

    const connectedUserIds = connections.map(conn => conn.toId);

    // get pagination params
    const limit = Number(c.req.query('limit')) || 10;
    const cursor = c.req.query('cursor');


    const posts = await prisma.feed.findMany({
      where: {
        userId: {
          in: [...connectedUserIds, currentUserId]
        },
        ...(cursor ? {
          id: {
            lt: BigInt(cursor) // get posts with ID less than cursor
          }
        } : {})
      },
      take: limit,
      orderBy: {
        id: "desc" //  newest first
      },
      include: {
        user: {
          select: {
            fullName: true,
            profilePhotoPath: true
          }
        }
      }
    });

    // serialize
    const serializedPosts = posts.map(post => ({
      id: post.id.toString(),
      userId: post.userId.toString(),
      content: post.content,
      createdAt: post.createdAt.toISOString(),
      updatedAt: post.updatedAt.toISOString(),
      user: {
        fullName: post.user.fullName,
        profilePhotoPath: post.user.profilePhotoPath,
      }
    }));
    
    return c.json({
      success: true,
      message: "Feed data successfully fetched",
      body: {
        posts: serializedPosts,
        cursor: posts.length > 0 ? posts[posts.length - 1].id.toString() : null
      }
    }, 200);

  } catch(error) {
    return c.json({ 
      success: false, 
      message: 'Failed to fetch feed: ' + error, 
      body: null 
    }, 500);
  }
});

auth.get('/feed/:postId', async (c: Context) => {
  try {
    const postId = parseInt(c.req.param('postId'))
    const post = await prisma.feed.findUnique({
      where: { 
          id: postId 
      },
      include: {
          user: {
              select: {
                  id: true,
                  username: true,
                  fullName: true,
                  profilePhotoPath: true
              }
          }
      }
  });

    if (!post) {
      return c.json({ 
          success: false, 
          message: 'Post not found', 
          body: null 
      }, 404);
    }

    const serializedPost = {
      ...post,
      id: post.id.toString(),        
      userId: post.userId.toString(), 
      user: {
          ...post.user,
          id: post.user.id.toString() 
      }
  };

    return c.json({
      success: true,
      message: "Feed data successfully fetched",
      body: serializedPost
    }, 200);
  } catch(error) {
    return c.json({ 
      success: false, 
      message: 'Failed to fetch feed: ' + error, 
      body: null 
    }, 500);
  }
})

auth.post('/feed', async (c) => {
  try{
    const token = getCookie(c, "token");
    if (!token) return c.json({ 
      success: false, 
      message: 'No token found', 
      body: null 
    }, 401);
    const decoded = await verifyToken(token);

    const { content } = await c.req.json(); 

    await prisma.feed.create({
      data: {
        content: content,
        userId: BigInt(decoded.userId)
      }
    })

    return c.json({
      success: true,
      message: "Feed Post Successful",
      body: null
    });

  } catch(error){
    return c.json({ 
      success: false, 
      message: 'Failed to post feed: ' + error, 
      body: null 
    }, 500);
  }
})

auth.put('/feed/:post_id', async (c) => {
  try{
    const token = getCookie(c, "token");

    if (!token) return c.json({ 
      success: false, 
      message: 'No token found', 
      body: null 
    }, 401);

    await verifyToken(token);

    const { content } = await c.req.json(); 
    const post_id = parseInt(c.req.param('post_id'))

    await prisma.feed.update({
      where:{
        id: post_id
      },
      data: {
        content: content,
      }
    })

    return c.json({
      success: true,
      message: "Feed Update Successful",
      body: null
    }, 200);

  } catch(error){
    return c.json({ 
      success: false, 
      message: 'Failed to update feed: ' + error, 
      body: null 
    }, 500);
  }
})

auth.delete('/feed/:post_id', async (c) => {
  try{
    const token = getCookie(c, "token");

    if (!token) return c.json({ 
      success: false, 
      message: 'No token found', 
      body: null 
    }, 401);

    await verifyToken(token);

    const post_id = parseInt(c.req.param('post_id'))
    await prisma.feed.delete({
      where:{
        id: post_id
      }
    })

    return c.json({
      success: true,
      message: "Feed Delete Successful",
      body: null
    }, 200);

  } catch(error){
    return c.json({ 
      success: false, 
      message: error, 
      body: null 
    }, 500);
  }
})

auth.get('/network/recommendations', async (c: Context) => {
  try {
    const token = getCookie(c, 'token');
    if (!token) return c.json({ 
      success: false, 
      message: 'No token found', 
      body: null 
    }, 401);
    
    const decoded = await verifyToken(token);
    const userId = BigInt(decoded.userId);

    // get direct connections (1st degree)
    const firstDegreeConnections = await prisma.connection.findMany({
      where: { fromId: userId },
      select: { toId: true }
    });
    const firstDegreeIds = firstDegreeConnections.map(conn => conn.toId);

    // get 2nd degree connections (users connected to 1st degree connections, exclude 1st degree and self)
    const secondDegreeConnections = await prisma.connection.findMany({
      where: {
        fromId: { in: firstDegreeIds },
        AND: {
          toId: {
            notIn: [...firstDegreeIds, userId], 
          }
        }
      },
      select: {
        toId: true,
        from: {
          select: {
            fullName: true
          }
        }
      }
    });
    const secondDegreeIds = [...new Set(secondDegreeConnections.map(conn => conn.toId))];

    // get 3rd degree connections (users connected to 2nd degree connections, exclude 1st, 2nd degree and self)
    const thirdDegreeConnections = await prisma.connection.findMany({
      where: {
        fromId: { in: secondDegreeIds },
        AND: {
          toId: {
            notIn: [...firstDegreeIds, ...secondDegreeIds, userId], 
          }
        }
      },
      select: {
        toId: true
      }
    });
    const thirdDegreeIds = [...new Set(thirdDegreeConnections.map(conn => conn.toId))];

    // get user details for 2nd degree connections
    const secondDegreeUsers = await prisma.user.findMany({
      where: {
        id: { in: secondDegreeIds }
      },
      select: {
        id: true,
        fullName: true,
        username: true,
        skills: true,
        workHistory: true,
        profilePhotoPath: true,
      }
    });

    // get user details for 3rd degree connections
    const thirdDegreeUsers = await prisma.user.findMany({
      where: {
        id: { in: thirdDegreeIds }
      },
      select: {
        id: true,
        fullName: true,
        username: true,
        skills: true,
        workHistory: true,
        profilePhotoPath: true,
      }
    });

    // create mutual connection counts for 2nd degree
    const secondDegreeWithMutuals = secondDegreeUsers.map(user => {
      const mutualConnections = secondDegreeConnections.filter(conn => 
        conn.toId === user.id
      ).length;
      return {
        ...user,
        id: user.id.toString(),
        mutualConnections,
        degree: 2
      };
    });

    // add degree information to 3rd degree connections
    const thirdDegreeWithDegree = thirdDegreeUsers.map(user => ({
      ...user,
      id: user.id.toString(),
      mutualConnections: 0,
      degree: 3
    }));

    // combine and sort recommendations
    const recommendations = [
      ...secondDegreeWithMutuals,
      ...thirdDegreeWithDegree
    ].sort((a, b) => {
      // sort by degree (2nd before 3rd)
      if (a.degree !== b.degree) {
        return a.degree - b.degree;
      }
      // then by number of mutual connections (higher first)
      return b.mutualConnections - a.mutualConnections;
    });

    return c.json({
      success: true,
      message: 'Connection recommendations retrieved successfully',
      body: {
        recommendations: recommendations.slice(0, 3) // limit to top 3 recommendations
      }
    }, 200);

  } catch (error) {
    console.error('Recommendations error:', error);
    return c.json({ 
      success: false, 
      message: 'Failed to get recommendations: ' + error, 
      body: null 
    }, 500);
  }
});

auth.get('/vapid-public', async (c) => {
  return c.json({public_key: VAPID_PUBLIC_KEY});
})

auth.post('/subscribe', async (c) => {
  try {
    const token = getCookie(c, "token");
    if (!token) return c.json({ 
      success: false, 
      message: 'No token found', 
      body: null 
    }, 401);
    const decoded = await verifyToken(token);
    const subscription = await c.req.json();
    await prisma.pushSubscription.upsert({
      where: { endpoint: subscription.endpoint },
      update: { keys: subscription.keys, userId: BigInt(decoded.userId), createdAt: new Date()},
      create: { endpoint: subscription.endpoint, keys: subscription.keys, userId: BigInt(decoded.userId), createdAt: new Date()},
    });
    return c.json({status: 'success'}, 201);
  } catch (error) {
    console.error('Error subscribing:', error);
    return c.json({ error: 'Invalid subscription' }, 400);
  }
});

auth.post('/send-notif-post', async (c) => {
  try {
    const token = getCookie(c, "token");
    if (!token) return c.json({ 
      success: false, 
      message: 'No token found', 
      body: null 
    }, 401);
    const decoded = await verifyToken(token);
    const isinya = await c.req.json();
    const latestFeed = await prisma.feed.findMany({
      where: {
        userId: BigInt(decoded.userId),
      }, orderBy: {
        createdAt: 'desc',
      }, take: 1, select: {
        id: true,
      }
    })
    const notifPayload = {
      title: isinya.title,
      body: isinya.body,
      data: {
        url: "http://localhost:5173/feed/" + latestFeed[0].id
      }
    }
    const connectedUsers = await prisma.connection.findMany({
      where: {
        fromId: BigInt(decoded.userId),
      }, select: {
        toId: true,
      }
    });
    const connectedUserIds = connectedUsers.map((con) => con.toId);
    const subscriptions = await prisma.pushSubscription.findMany({
      where: {
        userId: {
          in: connectedUserIds,
        }
      }, 
      orderBy: {
        createdAt: 'desc',
      },
    });
    for (const subscription of subscriptions) {
      if (typeof subscription.keys === 'object' && subscription.keys !== null) {
        // console.log("halo halo")
        const keys = subscription.keys as { auth: string; p256dh: string };
        try {
          await webPush.sendNotification(
            {
              endpoint: subscription.endpoint,
              keys: {
                auth: keys.auth, 
                p256dh: keys.p256dh 
              }
            },
            JSON.stringify(notifPayload)
          );
        } catch(error) {
          // console.log("errornya: " + error);
        }
      }
    };
    return c.json({status: 'success'}, 200);
  } catch (error) {
    console.error('Error sending notification:', error);
    return c.json({ error: 'Failed to send notification' }, 500);
  }
});

auth.post('/send-notif-chat', async(c) =>{
  try{
    const isinya = await c.req.json();
    const uname = await prisma.user.findMany({
      where: {
        id: isinya.userId
      }, take: 1
    });

    const notifPayload = {
      title: uname[0].username,
      body: isinya.message,
      data: {
        url: "http://localhost:5173/chat?id=" + isinya.userId
      }
    }
    const subscriptions = await prisma.pushSubscription.findMany({
      where: {
        userId: isinya.toId,
      }, 
      orderBy: {
        createdAt: 'desc',
      }, take: 1,
    });
    // console.log("halo")
    const subscription = subscriptions[0];
    if (typeof subscription.keys === 'object' && subscription.keys !== null) {
      // console.log("halo halo")
      const keys = subscription.keys as { auth: string; p256dh: string };
      try {
        await webPush.sendNotification(
          {
            endpoint: subscription.endpoint,
            keys: {
              auth: keys.auth, 
              p256dh: keys.p256dh 
            }
          },
          JSON.stringify(notifPayload)
        );
      } catch(error) {
        // console.log("errornya: " + error);
      }
    }
    return c.json({status: 'success'}, 200);
  } catch (error){
    console.error('Error sending notification:', error);
    return c.json({ error: 'Failed to send notification' }, 500);
  }
})


export default auth;