import { Hono } from 'hono';
import type { Context } from 'hono';
import { getCookie, setCookie } from 'hono/cookie'
import bcryptjs from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../db/connections.js';

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

// Add logout endpoint
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
    const { username, fullName, email, password, confirmPassword } = await c.req.json();

    if (!username || !email || !password || !confirmPassword) {
      return c.json({ 
        success: false, 
        message: 'All fields excepts fullName are required', 
        body: null 
      }, 400);
    }
    
    const existingUser = await prisma.user.findFirst({
      where: { OR: [{ email }, { username }] }
    });

    if (existingUser) {
      return c.json({ 
        success: false, 
        message: 'User already exists', 
        body: null 
      }, 400);
    }

    if (password !== confirmPassword) {
      return c.json({ 
        success: false, 
        message: 'Passwords do not match', 
        body: null 
      }, 400);
    }

    // Using bcrypt with salt round 10 as required
    const hashedPassword = await bcryptjs.hash(password, 10);

    await prisma.user.create({
      data: {
        username,
        fullName,
        email,
        passwordHash: hashedPassword,
        profilePhotoPath: '/app/frontend/src/assets/default.jpg'
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
      message: `Registration failed: ${error}`, 
      body: null 
    }, 500);
  }
});

auth.post('/login', async (c) => {
  try {
    const { email, password } = await c.req.json();

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
      message: 'Login Success!',
      body: {
        token
      }
    });
  } catch (error) {
    return c.json({ 
      success: false, 
      message: 'Login failed', 
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

    const token = getCookie(c, 'jwt');

    if (!token) {
      return c.json({
        success: true,
        message: 'Public Profile',
        body: {
          fullName: user.fullName,
          skills: user.skills,
          workHistory: user.workHistory,
          profilePhotoPath: user.profilePhotoPath
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
          profilePhotoPath: user.profilePhotoPath
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
          profilePhotoPath: user.profilePhotoPath
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

export default auth;