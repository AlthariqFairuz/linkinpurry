import { Hono } from 'hono';
import type { Context } from 'hono';
import { getCookie, setCookie } from 'hono/cookie'
import bcryptjs from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../db/connections.js';
import { mkdir, writeFile } from 'fs/promises';
import { join, extname } from 'path';

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

    const { fullName, username, skills, workHistory } = await c.req.json();
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

    const existingUser = await prisma.user.findFirst({
      where: { 
        username,
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

    await prisma.user.update({
      where: { id: userId },
      data: {
        fullName,
        username,
        skills,
        workHistory
      }
    });

    return c.json({
      success: true,
      message: 'Update successful',
      body: null
    });

  } catch (error) {
    return c.json({ 
      success: false, 
      message: 'Update failed', 
      body: error
    }, 500);
  }
});

auth.post('/profile/:id/photo', async (c) => {
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

    const formData = await c.req.formData();
   const file = formData.get('photo') as File;
   
   if (!file) {
     return c.json({ 
       success: false, 
       message: 'No file uploaded', 
       body: null 
     }, 400);
   }
    // Validate file type
   const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
   if (!allowedTypes.includes(file.type)) {
     return c.json({ 
       success: false, 
       message: 'Invalid file type. Only JPEG, PNG and WebP are allowed.', 
       body: null 
     }, 400);
   }
    // Create unique filename
   const fileExt = extname(file.name) || '.webp';
   const fileName = `${createId()}_${userId}${fileExt}`;
   
   try {
     // Update the path to be absolute and ensure it exists
     const uploadDir = join(process.cwd(), '..', 'frontend', 'public', 'images');
     
     // Log the path to verify it's correct
     console.log('Upload directory:', uploadDir);
     
     // Create directory if it doesn't exist
     await mkdir(uploadDir, { recursive: true });
      const arrayBuffer = await file.arrayBuffer();
     const buffer = Buffer.from(arrayBuffer);
     const filePath = join(uploadDir, fileName);
     
     // Log the full file path
     console.log('Saving file to:', filePath);
     
     await writeFile(filePath, buffer);
     console.log('File written successfully');
     
     // Store only the relative path in database
     const profilePhotoPath = `/images/${fileName}`;
     await prisma.user.update({
       where: { id: userId },
       data: { profilePhotoPath }
     });
      return c.json({
       success: true,
       message: 'Photo uploaded successfully',
       body: { profilePhotoPath }
     });
   } catch (fileError) {
     console.error('File system error:', fileError);
     return c.json({ 
       success: false, 
       message: 'Failed to save file to disk', 
       body: fileError 
     }, 500);
   }
 } catch (error) {
   console.error('Upload error:', error);
   return c.json({ 
     success: false, 
     message: 'Failed to upload photo', 
     body: error 
   }, 500);
 }
});

export default auth;