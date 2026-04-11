import dotenv from 'dotenv';
dotenv.config();

export function createApp() {
  const app = (await import('../server.js')).default || (await import('../server.js')).app;
  return app;
}
