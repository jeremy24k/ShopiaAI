import { describe, it, expect, beforeAll } from '@jest/globals';
import request from 'supertest';
import { createTestApp } from '../app.test.js';

describe('Health Check', () => {
  let app;

  beforeAll(() => {
    app = createTestApp();
  });

  it('GET /health returns 200', async () => {
    const res = await request(app)
      .get('/health')
      .expect(200);

    expect(res.body.status).toBe('ok');
    expect(res.body.timestamp).toBeDefined();
  });

  it('GET / returns API info', async () => {
    const res = await request(app)
      .get('/')
      .expect(200);

    expect(res.body.message).toBe('Bible API Backend test');
    expect(res.body.version).toBe('1.0.0');
  });

  it('GET /health includes timestamp', async () => {
    const res = await request(app)
      .get('/health')
      .expect(200);

    expect(res.body.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
  });
});

describe('404 Handler', () => {
  let app;

  beforeAll(() => {
    app = createTestApp();
  });

  it('returns 404 for unknown routes', async () => {
    const res = await request(app)
      .get('/unknown-route-that-does-not-exist')
      .expect(404);

    expect(res.body.success).toBe(false);
    expect(res.body.error).toBe('Ruta no encontrada');
  });

  it('returns 404 for unknown API routes', async () => {
    const res = await request(app)
      .get('/api/unknown-endpoint')
      .expect(404);

    expect(res.body.success).toBe(false);
  });
});

describe('Error Handler', () => {
  let app;

  beforeAll(() => {
    app = createTestApp();
  });

  it('returns 500 for invalid JSON', async () => {
    const res = await request(app)
      .post('/api/feedback')
      .set('Content-Type', 'application/json')
      .send('invalid json');

    expect(res.status).toBeGreaterThanOrEqual(400);
  });
});
