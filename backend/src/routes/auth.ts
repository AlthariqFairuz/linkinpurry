import { Hono } from 'hono';
import type { Context } from 'hono';
import { getCookie, setCookie } from 'hono/cookie'
import bcryptjs from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { prisma } from '../db/connections.js';
import { uploadToCloudinary } from '../utils/cloudinary.js';

const auth = new Hono();

BigInt.prototype.toJSON = function () {
  return this.toString();
}

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
const verifyToken = (token: string): Promise<any> => {
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
        AND: [
          {
            id: {
              not: userId
            }
          }
        ]
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
      message: 'Connection-status success',
      body: {
        connected: connection !== null
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

auth.get('/network/unconnected', async (c) => {
  try {
    const token = getCookie(c, 'jwt');

    if (!token) {
      return c.json({ success: false, 
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

    const requested = await prisma.connectionRequest.findMany({
      where: {
        fromId: userId
      }
    });
    
    const connected = await prisma.connection.findMany({
      where: {
        OR: [
          {
            fromId: userId
          },
          {
            toId: userId
          }
        ]
      }
    });
    
    const union = [...new Set([...requested, ...connected])];
 
    const connection = await prisma.user.findMany({ 
      where: {
        id: {
          not: userId,
          notIn: union.map(conn => conn.toId)
        },
      },
      select: {
        id: true,
        fullName: true,
        skills: true,
        workHistory: true,
        profilePhotoPath: true,
      }
    });

    return c.json({
      success: true,
      message: 'Connection-status success',
      body: {
        connection: connection
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

auth.get('/network/requested', async (c) => {
  try {
    const token = getCookie(c, 'jwt');

    if (!token) {
      return c.json({ success: false, 
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
    
    const requested = await prisma.connectionRequest.findMany({
      where: {
        fromId: userId
      }
    });
    
    const connection = await prisma.user.findMany({ 
      where: {
        id: {
          not: userId,
          in: requested.map(conn => conn.toId)
        },
      },
      select: {
        id: true,
        fullName: true,
        skills: true,
        workHistory: true,
        profilePhotoPath: true,
      }
    });

    return c.json({
      success: true,
      message: 'Connection-status success',
      body: {
        connection: connection
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

auth.get('/network/connected', async (c) => {
  try {
    const token = getCookie(c, 'jwt');

    if (!token) {
      return c.json({ success: false, 
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
    
    const connected = await prisma.connection.findMany({
      where: {
        OR: [
          {
            fromId: userId
          },
          {
            toId: userId
          }
        ]
      }
    });
    
    const connection = await prisma.user.findMany({ 
      where: {
        id: {
          not: userId,
          in: connected.map(conn => conn.toId)
        },
      },
      select: {
        id: true,
        fullName: true,
        skills: true,
        workHistory: true,
        profilePhotoPath: true,
      }
    });

    return c.json({
      success: true,
      message: 'Connection-status success',
      body: {
        connection: connection
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

auth.post('/connect/:id', async (c) => {
  try {
    const toId = BigInt(c.req.param('id'));

    const toUser = await prisma.user.findUnique({ 
      where: { id: toId }
    });

    if (!toUser) {
      return c.json({ 
        success: false, 
        message: 'Invalid user',
        body: null 
      }, 401);
    }

    const token = getCookie(c, 'jwt');

    if (!token) {
      return c.json({
        success: false,
        message: 'No token found',
        body: null
      });
    }
    const decoded = await verifyToken(token);
    const userId = decoded.userId;
    
    if (userId == toId) {
      return c.json({
        success: false,
        message: 'Target is user',
        body: null
      });
    }

    // check if requested
    const isRequested = await prisma.connectionRequest.findFirst({ 
      where: {
        fromId: userId,
        toId: toId
      }
    });

    // check if connected
    const isConnected = await prisma.connection.findFirst({ 
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

    if (isRequested !== null && isConnected !== null) {
      return c.json({
        success: false,
        message: 'Is requested/connected',
        body: null
      });
    }

    // create new request
    var date = new Date();
    date.toISOString();
    await prisma.connectionRequest.create({
      data: {
        fromId: userId,
        toId: toId,
        createdAt: date
      }
    });

    return c.json({
      success: true,
      message: "Request Successful",
      body: null
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

export default auth;