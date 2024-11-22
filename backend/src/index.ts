import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { PrismaClient } from '@prisma/client';
import { createClient } from 'redis';
import { config } from 'dotenv';
import jwt from 'jsonwebtoken';
import bcryptjs from 'bcryptjs';

// load env
config();

const app = new Hono();
const prisma = new PrismaClient();
const redis = createClient({
  url: process.env.REDIS_URL
});

// Configure CORS
app.use('/*', cors());

// Basic health check route
app.get('/', (c) => {
  return c.json({ status: 'ok', message: 'Server is running' });
});

// Error handling middleware
app.onError((err, c) => {
  console.error(`Error: ${err}`);
  return c.json({ error: 'Internal Server Error' }, 500);
});

// Start server
const port = parseInt(process.env.PORT || '3000');

serve({
  fetch: app.fetch,
  port
});

console.log(`Server is running on port ${port}`);

app.post('/auth/register', async (c) => {
  try {
    const { username, email, password } = await c.req.json();
    
    // Check if user exists
    const existingUser = await prisma.user.findFirst({
      where: { OR: [{ email }, { username }] }
    });

    if (existingUser) {
      return c.json({ success: false, error: 'User already exists' }, 400);
    }

    // Hash password - update the hash call
    const hashedPassword = await bcryptjs.hash(password, 10);

    // Create user
    const user = await prisma.user.create({
      data: {
        username,
        email,
        passwordHash: hashedPassword,
      }
    });

    // Generate token
    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );

    return c.json({
      success: true,
      data: {
        token,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          createdAt: user.createdAt,
        },
        tokenExpires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      }
    });
  } catch (error) {
    return c.json({ success: false, error: 'Registration failed' }, 500);
  }
});

app.post('/auth/login', async (c) => {
  try {
    const { email, password } = await c.req.json();

    // Find user
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return c.json({ success: false, error: 'Invalid credentials' }, 401);
    }

    // Verify password - update the compare call
    const isValid = await bcryptjs.compare(password, user.passwordHash);
    if (!isValid) {
      return c.json({ success: false, error: 'Invalid credentials' }, 401);
    }

    // Generate token
    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );

    return c.json({
      success: true,
      data: {
        token,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          createdAt: user.createdAt,
        },
        tokenExpires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      }
    });
  } catch (error) {
    return c.json({ success: false, error: 'Login failed' }, 500);
  }
});