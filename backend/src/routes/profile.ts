import { Hono } from 'hono';
import { prisma } from '../db/connections.js';

const profile = new Hono();

profile.get('/:username', async (c) => {
  const username = c.req.param('username');
  const user = await prisma.user.findUnique({ where: { username } });
  return c.json(user);
});

export default profile;

