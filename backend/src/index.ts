import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { config } from 'dotenv';
import auth from './api/api.js';
import { swaggerUI } from '@hono/swagger-ui';
import { swaggerConfig } from './swagger.js';

// load env
config();

const app = new Hono();

const corsOptions = {
  origin: 'http://localhost:5173', 
  credentials: true,
};

// Configure CORS
app.use('/*', cors(corsOptions));

// // Basic health check route
// app.get('/', (c) => {
//   return c.json({ status: 'ok', message: 'Server is running' });
// });

// Serve Swagger UI
app.get('/swagger', swaggerUI({ url: '/docs' }));
app.get('/docs', (c) => c.json(swaggerConfig));

// Mount auth routes
app.route('/api', auth);

// Error handling middleware
app.onError((err, c) => {
  console.error(`Error: ${err}`);
  return c.json({ 
    success: false, 
    message: 'Internal Server Error', 
    body: null 
  }, 500);
});

// Start server
const port = parseInt(process.env.PORT || '3000');

serve({
  fetch: app.fetch,
  port
});