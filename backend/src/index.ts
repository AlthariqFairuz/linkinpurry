import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { PrismaClient } from '@prisma/client';
import { createClient } from 'redis';
import { config } from 'dotenv';
import auth from './routes/auth.js';

// load env
config();

const app = new Hono();
export const prisma = new PrismaClient();
export const redis = createClient({
  url: process.env.REDIS_URL
});

// Configure CORS
app.use('/*', cors());

// Mount auth routes
app.route('/auth', auth);

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