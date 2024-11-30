import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { config } from 'dotenv';
import auth from './api/api.js';
import { swaggerUI } from '@hono/swagger-ui';
import { swaggerConfig } from './swagger.js';
import { initializeWebSocket } from './websocket/socket.js';
import { serve } from '@hono/node-server';
import { Server as HttpServer } from 'http';

// load env
config();

const app = new Hono();

const corsOptions = {
  origin: 'http://localhost:5173', 
  credentials: true,
};

// Configure CORS
app.use('/*', cors(corsOptions));

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

// More simple approach, credit to: https://github.com/orgs/honojs/discussions/1781
// Create server, user serve to create a server that can handle incoming HTTP requests
const port = parseInt(process.env.PORT || '3000');

const server = serve({
  fetch: app.fetch, // here app.fetch is the the handler for incoming requests
  port: port,
});

initializeWebSocket(server as HttpServer);
