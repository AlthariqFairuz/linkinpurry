import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { config } from 'dotenv';
import auth from './routes/auth.js';
import { prisma, redis } from './db/connections.js'; 

// load env
config();

const app = new Hono();

// Configure CORS
app.use('/*', cors());

// Mount auth routes
app.route('/api', auth);

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