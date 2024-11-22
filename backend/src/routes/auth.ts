import { Hono } from 'hono';
import { hash, compare } from 'bcrypt';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

type Env = {
  JWT_SECRET: string;
};

const prisma = new PrismaClient();
const auth = new Hono<{ Bindings: Env }>();

// JWT Configuration
const JWT_EXPIRES_IN = '1h'; // Token expires in 1 hour

// Helper function to generate JWT
const generateToken = (userId: bigint, email: string) => {
  return jwt.sign(
    { 
      userId: userId.toString(), // Convert BigInt to string for JWT
      email: email 
    }, 
    process.env.JWT_SECRET!, 
    { 
      expiresIn: JWT_EXPIRES_IN 
    }
  );
};

auth.post('/register', async (c) => {
  try {
    const { username, email, password } = await c.req.json();

    // Input validation
    if (!username || !email || !password) {
      return c.json({ 
        success: false,
        error: 'Username, email, and password are required' 
      }, 400);
    }

    // Check if username already exists
    const existingUsername = await prisma.user.findUnique({
      where: {
        username: username,
      },
    });

    if (existingUsername) {
      return c.json({ 
        success: false,
        error: 'Username already taken' 
      }, 400);
    }

    // Check if email already exists
    const existingEmail = await prisma.user.findUnique({
      where: {
        email: email,
      },
    });

    if (existingEmail) {
      return c.json({ 
        success: false,
        error: 'Email already registered' 
      }, 400);
    }

    // Hash password
    const hashedPassword = await hash(password, 10);

    // Create new user
    const newUser = await prisma.user.create({
      data: {
        username,
        email,
        passwordHash: hashedPassword,
      },
      select: {
        id: true,
        username: true,
        email: true,
        createdAt: true
      }
    });

    // Generate JWT with expiration
    const token = generateToken(newUser.id, newUser.email);

    return c.json({
      success: true,
      data: {
        token,
        user: newUser,
        tokenExpires: JWT_EXPIRES_IN
      }
    });

  } catch (error) {
    console.error('Registration error:', error);
    return c.json({ 
      success: false,
      error: 'Internal server error' 
    }, 500);
  }
});

auth.post('/login', async (c) => {
  try {
    const { email, password } = await c.req.json();

    // Input validation
    if (!email || !password) {
      return c.json({ 
        success: false,
        error: 'Email and password are required' 
      }, 400);
    }

    // Find user by email
    const user = await prisma.user.findUnique({
      where: {
        email: email,
      },
    });

    if (!user) {
      return c.json({ 
        success: false,
        error: 'Invalid credentials' 
      }, 401);
    }

    // Compare password
    const isValidPassword = await compare(password, user.passwordHash);

    if (!isValidPassword) {
      return c.json({ 
        success: false,
        error: 'Invalid credentials' 
      }, 401);
    }

    // Generate JWT with expiration
    const token = generateToken(user.id, user.email);

    return c.json({
      success: true,
      data: {
        token,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          createdAt: user.createdAt
        },
        tokenExpires: JWT_EXPIRES_IN
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    return c.json({ 
      success: false,
      error: 'Internal server error' 
    }, 500);
  }
});

// // Add a middleware to verify JWT
// const verifyJWT = async (c, next) => {
//   try {
//     const authHeader = c.req.header('Authorization');
    
//     if (!authHeader || !authHeader.startsWith('Bearer ')) {
//       return c.json({ 
//         success: false, 
//         error: 'No token provided' 
//       }, 401);
//     }

//     const token = authHeader.split(' ')[1];
//     const decoded = jwt.verify(token, c.env.JWT_SECRET) as { userId: string; email: string };
    
//     // Add decoded user to context for use in protected routes
//     c.set('user', decoded);
    
//     await next();
//   } catch (error) {
//     if (error instanceof jwt.TokenExpiredError) {
//       return c.json({ 
//         success: false, 
//         error: 'Token expired' 
//       }, 401);
//     }
    
//     return c.json({ 
//       success: false, 
//       error: 'Invalid token' 
//     }, 401);
//   }
// };

export default auth;