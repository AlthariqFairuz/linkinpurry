import { Hono } from 'hono';
import bcryptjs from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../db/connections.js';

const auth = new Hono();

// Helper function to generate JWT
const generateToken = (user: { id: bigint; email: string; username: string }) => {

  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is not defined in environment variables');
  }

  return jwt.sign(
    {
      userId: user.id.toString(), // Convert BigInt to string for JWT
      email: user.email,
      username: user.username,
      iat: Math.floor(Date.now() / 1000), // Issued at timestamp
      exp: Math.floor(Date.now() / 1000) + (60 * 60), // Expires in 1 hours
    },
    process.env.JWT_SECRET
  );
};

auth.post('/register', async (c) => {
  try {
    const { username, email, password } = await c.req.json();

    if (!username || !email || !password) {
      return c.json({ 
        success: false, 
        error: 'All fields are required' 
      }, 400);
    }
    
    // Check if user exists
    const existingUser = await prisma.user.findFirst({
      where: { OR: [{ email }, { username }] }
    });

    if (existingUser) {
      return c.json({ success: false, error: 'User already exists' }, 400);
    }

    // Hash password
    const hashedPassword = await bcryptjs.hash(password, 10);

    // Create user
    const user = await prisma.user.create({
      data: {
        username,
        email,
        passwordHash: hashedPassword,
      },
      select: {
        id: true,
        username: true,
        email: true,
      }
    });

    // Generate token using the helper function
    const token = generateToken(user);

    return c.json({
      success: true,
      data: {
        token
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    return c.json({ success: false, error: 'Registration failed' }, 500);
  }
});

auth.post('/login', async (c) => {
  try {
    const { email, password } = await c.req.json();

    // Find user
    const user = await prisma.user.findUnique({ 
      where: { email },
      select: {
        id: true,
        email: true,
        username: true,
        passwordHash: true,
      }
    });

    if (!user) {
      return c.json({ success: false, error: 'Invalid credentials' }, 401);
    }

    // Verify password
    const isValid = await bcryptjs.compare(password, user.passwordHash);
    if (!isValid) {
      return c.json({ success: false, error: 'Invalid credentials' }, 401);
    }

    // Generate token using the helper function
    const token = generateToken(user);

    return c.json({
      success: true,
      data: {
        token
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    return c.json({ success: false, error: 'Login failed' }, 500);
  }
});

export default auth;