import { Hono } from 'hono';
import type { Context } from 'hono';
import { getCookie, setCookie } from 'hono/cookie'
import bcryptjs from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../db/connections.js';

const auth = new Hono();

// Helper function to generate JWT with exactly 1 hour TTL
const generateToken = (user: { id: bigint; email: string; username: string }) => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET is not defined in environment variables');
  }

  return jwt.sign(
    {
      userId: user.id.toString(),
      email: user.email,
      username: user.username,
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

// Add verify endpoint
auth.get('/verify', async (c) => {
  try {
    const token = getCookie(c, 'jwt');
    
    if (!token) {
      return c.json({ success: false, error: 'No token found' }, 401);
    }

    const decoded = await verifyToken(token);
    
    // Check if token is expired
    if (decoded.exp * 1000 < Date.now()) {
      removeTokenCookie(c);
      return c.json({ success: false, error: 'Token expired' }, 401);
    }

    return c.json({
      success: true,
      token,
      data: {
        userId: decoded.userId,
        email: decoded.email,
        username: decoded.username
      }
    });
  } catch (error) {
    removeTokenCookie(c);
    return c.json({ success: false, error: 'Invalid token' }, 401);
  }
});

// Add logout endpoint
auth.post('/logout', (c) => {
  removeTokenCookie(c);
  return c.json({ success: true, message: 'Logged out successfully' });
});

auth.post('/register', async (c) => {
  try {
    const { username, email, password } = await c.req.json();

    if (!username || !email || !password) {
      return c.json({ success: false, error: 'All fields are required' }, 400);
    }
    
    const existingUser = await prisma.user.findFirst({
      where: { OR: [{ email }, { username }] }
    });

    if (existingUser) {
      return c.json({ success: false, error: 'User already exists' }, 400);
    }

    // Using bcrypt with salt round 10 as required
    const hashedPassword = await bcryptjs.hash(password, 10);

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

    return c.json({
      success: true,
      message: "Registration Successful",
    });
  } catch (error) {
    return c.json({ success: false, error: 'Registration failed' }, 500);
  }
});

auth.post('/login', async (c) => {
  try {
    const { email, password } = await c.req.json();

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
      return c.json({ 
        success: false, 
        message: 'Invalid credentials',
        error: 'Invalid credentials'
      }, 401);
    }

    const isValid = await bcryptjs.compare(password, user.passwordHash);
    if (!isValid) {
      return c.json({ 
        success: false, 
        message: 'Invalid credentials',
        error: 'Invalid credentials'
      }, 401);
    }

    const token = generateToken(user);
    setTokenCookie(c, token);

    return c.json({
      success: true,
      message: 'Login Success!',
      data: {
        token
      }
    });
  } catch (error) {
    return c.json({ success: false, error: 'Login failed' }, 500);
  }
});

export default auth;