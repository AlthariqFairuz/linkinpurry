import { Hono } from 'hono';
import type { Context } from 'hono';
import { getCookie, setCookie } from 'hono/cookie'
import bcryptjs from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { prisma } from '../db/connections.js';
import { uploadToCloudinary } from '../utils/cloudinary.js';

const auth = new Hono();

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
  setCookie(c, 'jwt', token, {
    httpOnly: true,
    secure: true, 
    sameSite: 'lax',
    maxAge: 3600,  
    path: '/'
  });
};

// Helper function to clear JWT cookie
const removeTokenCookie = (c: Context) => {
  setCookie(c, 'jwt', '', {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    maxAge: 0,
    path: '/'
  });
};

// Verify JWT token from cookie
export const verifyToken = (token: string): Promise<any> => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET is not defined');
  }
  
  return new Promise((resolve, reject) => {
    jwt.verify(token, secret, (err, decoded) => {
      if (err) reject(err);
      resolve(decoded);
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
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"], 
});

// Add verify endpoint
auth.get('/verify', async (c) => {
  try {
    const token = getCookie(c, 'jwt');
    
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
        fullName: decoded.fullName
      }
    });
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
  });
});

auth.post('/register', async (c) => {
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
         fullName: validatedData.fullName || null,
         email: validatedData.email,
         passwordHash: hashedPassword,
         profilePhotoPath: '/images/default.webp'
       }
     });
 
     return c.json({
       success: true,
       message: "Registration Successful",
       body: null
     });
   } catch (error) {
     return c.json({ 
       success: false, 
       message: 'Registration failed', 
       body: null 
     }, 500);
   }
 });

 auth.post('/login', async (c) => {
  try {
    const { email, password } = await c.req.json();

    // Validate input
    if (!email || !password) {
      return c.json({ 
        success: false, 
        message: 'Email and password are required',
        body: null 
      }, 400);
    }

    const user = await prisma.user.findUnique({ 
      where: { email }
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
      message: `Welcome back, ${user.fullName}!`,
      body: {
        token
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    return c.json({ 
      success: false, 
      message: 'An error occurred during login. Please try again.', 
      body: null 
    }, 500);
  }
});

auth.get('/profile/:id', async (c) => {
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
      where : {
        fromId: userId
      }
    });

    const token = getCookie(c, 'jwt');

    if (!token) {
      return c.json({
        success: true,
        message: 'Public Profile',
        body: {
          fullName: user.fullName,
          skills: user.skills,
          workHistory: user.workHistory,
          profilePhotoPath: user.profilePhotoPath,
          connections: numberOfConnections
        }
      });
    }
    const decoded = await verifyToken(token);
    
    if (decoded.userId == userId) {
      return c.json({
        success: true,
        message: 'Owner profile',
        body: {
          email: user.email,
          username: user.username,
          fullName: user.fullName,
          skills: user.skills,
          workHistory: user.workHistory,
          profilePhotoPath: user.profilePhotoPath,
          connections: numberOfConnections
        }
      });
    }

    else {
      return c.json({
        success: true,
        message: 'Public Profile',
        body: {
          fullName: user.fullName,
          skills: user.skills,
          workHistory: user.workHistory,
          profilePhotoPath: user.profilePhotoPath,
          connections: numberOfConnections
        }
      });
    } 

  } catch (error) {
    removeTokenCookie(c);
    return c.json({ 
      success: false, 
      message: 'Invalid token', 
      body: error
    }, 401);
  }
});

auth.put('/profile/:id', async (c) => {
  try {
    const token = getCookie(c, 'jwt');

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
    
    const fullName = formData.get('fullName') as string;
    const username = formData.get('username') as string;
    const skills = formData.get('skills') as string;
    const workHistory = formData.get('workHistory') as string;
    const photo = formData.get('photo') as File | null;

    if (!username) {
      return c.json({ 
        success: false, 
        message: 'Invalid username',
        body: null 
      }, 400);
    }

    const existingUser = await prisma.user.findFirst({
      where: { 
        username: username,
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
    let profilePhotoPath = user.profilePhotoPath;
    if (photo) {
      // Convert File to buffer for Cloudinary
      const arrayBuffer = await photo.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      
      // Create file-like object for Cloudinary
      const fileObject = {
        buffer,
        mimetype: photo.type,
      };
      
      profilePhotoPath = await uploadToCloudinary(fileObject);
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        fullName,
        username,
        skills,
        workHistory,
        profilePhotoPath
      }
    });

    return c.json({
      success: true,
      message: 'Update successful',
      body: {
        fullName: updatedUser.fullName,
        username: updatedUser.username,
        skills: updatedUser.skills,
        workHistory: updatedUser.workHistory,
        profilePhotoPath: updatedUser.profilePhotoPath
      }
    });

  } catch (error) {
    console.error('Update error:', error);
    return c.json({ 
      success: false, 
      message: 'Update failed', 
      body: error 
    }, 500);
  }
});

auth.get('/users/search', async (c) => {
  try {

    const { q } = c.req.query();

    //case sensitive search ga pake mode insensitive
    const users = await prisma.user.findMany({
      where: {
        OR: [
          {
            username: {
              contains: q,
            }
          },
          {
            fullName: {
              contains: q,
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
          id: user.id.toString()
        }))
      }
    });

  } catch (error) {
    console.error('Search error:', error);
    return c.json({
      success: false,
      message: 'Failed to perform search',
      body: null
    }, 500);
  }
});

auth.get('/connection-status/:id', async (c) => {
  try {
    const toId = BigInt(c.req.param('id'));

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

    const token = getCookie(c, 'jwt');

    if (!token) {
      return c.json({ success: false, 
        message: 'No token found', 
        body: null 
      }, 401);
    }
    
    const decoded = await verifyToken(token);
    const userId = decoded.userId;

    if (userId == toId) {
      return c.json({
        success: true,
        message: 'Self connection',
        body: {
          connected: true
        }
      });
    }

    const connection = await prisma.connection.findFirst({ 
      where: {
        OR: [
          {
            fromId: userId,
            toId: toId
          },
          {
            toId: userId,
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
    });

  } catch (error) {
    removeTokenCookie(c);
    return c.json({ 
      success: false, 
      message: 'Failed to retrieve connection status: ' + error, 
      body: error
    }, 401);
  }
});

auth.get('/network/unconnected', async (c) => {
  try {
    const token = getCookie(c, 'jwt');
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
    });

  } catch (error) {
    removeTokenCookie(c);
    return c.json({ 
      success: false, 
      message: 'Failed to retrieve connection status: ' + error, 
      body: error 
    }, 401);
  }
});

auth.get('/network/requested', async (c) => {
  try {
    const token = getCookie(c, 'jwt');
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
    });

  } catch (error) {
    removeTokenCookie(c);
    return c.json({ 
      success: false, 
      message: 'Failed to retrieve connection status: ' + error, 
      body: error 
    }, 401);
  }
});

auth.get('/network/incoming-requests', async (c) => { 
  try {
    const token = getCookie(c, 'jwt');
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
          { sentRequests: {
            some: {
              toId: userId
            }
          }
          },
          {
            NOT: {
              // sama juga, current user Belum terhubung dengan user X secara timbal balik
              OR: [
              { receivedConnections: { some: { fromId: userId } } },
                { sentConnections: { some: { toId: userId } } }
              ]
            }
          }
        ]
      },
      // cek incoming requests
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
      message: 'Incoming requests retrieved successfully',
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
    });

  } catch (error) {
    removeTokenCookie(c);
    return c.json({ 
      success: false, 
      message: 'Failed to retrieve connection status: ' + error, 
      body: error 
    }, 401);
  }
});

auth.get('/network/connected', async (c) => {
  try {
    const token = getCookie(c, 'jwt');

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
    });

  } catch (error) {
    console.log(error);
    removeTokenCookie(c);
    return c.json({ 
      success: false, 
      message: 'Invalid token', 
      body: error
    }, 401);
  }
});

auth.post('/request/:id', async (c) => {
  try {
    const token = getCookie(c, 'jwt');
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
      });
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
      });
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
    });

  } catch (error) {
    removeTokenCookie(c);
    return c.json({ 
      success: false, 
      message: 'Failed to send request: ' + error, 
      body: error
    }, 401);
  }
});

auth.post('/accept-request/:id', async (c) => {
  try {
    const token = getCookie(c, 'jwt');
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
      });
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
      })
    ]);

    return c.json({ 
      success: true, 
      message: 'Connection accepted', 
      body: null 
    });
  } catch (error) {
    removeTokenCookie(c);
    return c.json({ 
      success: false, 
      message: 'Failed to accept request: ' + error, 
      body: error 
    }, 500);
  }
});

// Decline connection request
auth.post('/decline-request/:id', async (c) => {
  try {
    const token = getCookie(c, 'jwt');
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
    });
  } catch (error) {
    removeTokenCookie(c); 
    return c.json({ 
      success : false, 
      message: 'Failed to decline request: ' + error, 
      body: error 
    }, 500);
  }
});

auth.post('/disconnect/:id', async (c) => {
  try {
    const token = getCookie(c, 'jwt');
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
    await prisma.connection.deleteMany({
      where: {
        OR: [
          { fromId, toId },
          { fromId: toId, toId: fromId }
        ]
      }
    });

    return c.json({
      success: true,
      message: 'Connection removed successfully',
      body: null
    });

  } catch (error) {
    console.error('Remove connection error:', error);
    return c.json({ 
      success: false, 
      message: 'Failed to remove connection', 
      body: error 
    }, 500);
  }
});

auth.get('/chat/history/:userId', async (c) => {
  try {
    const userId = c.req.param('userId');
    const token = getCookie(c, 'jwt');
    
    if (!token) {
      return c.json({ 
        success: false, 
        message: 'Unauthorized', 
        body: null 
      }, 401);
    }

    const decoded = await verifyToken(token);
    const currentUserId = decoded.userId;

    const messages = await prisma.chat.findMany({
      where: {
        OR: [
          { fromId: BigInt(currentUserId), toId: BigInt(userId) },
          { fromId: BigInt(userId), toId: BigInt(currentUserId) }
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
    });
  } catch (error) {
    console.error('Chat history error:', error);
    return c.json({ 
      success: false, 
      message: 'Failed to fetch chat history', 
      body: null 
    }, 500);
  }
});
export default auth;