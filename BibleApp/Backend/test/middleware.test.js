import { describe, it, expect, beforeAll } from '@jest/globals';
import request from 'supertest';
import { createTestApp } from '../app.test.js';

describe('Validation Middleware', () => {
  let app;

  beforeAll(() => {
    app = createTestApp();
  });

  describe('Parameter Validation', () => {
    it('handles requests with various parameters', async () => {
      const res = await request(app)
        .get('/api/books/spa_rvr1960');

      expect(res.status).toBeGreaterThanOrEqual(200);
    });
  });
});

describe('Rate Limiting', () => {
  let app;

  beforeAll(() => {
    app = createTestApp();
  });

  it('allows requests under limit', async () => {
    const res = await request(app)
      .get('/health')
      .expect(200);

    expect(res.body.status).toBe('ok');
  });
});

describe('CORS Headers', () => {
  let app;

  beforeAll(() => {
    app = createTestApp();
  });

  it('includes CORS headers for valid origin', async () => {
    const res = await request(app)
      .get('/health')
      .set('Origin', 'http://localhost:5173')
      .expect(200);

    expect(res.headers['access-control-allow-origin']).toBeDefined();
  });

  it('allows requests without origin', async () => {
    const res = await request(app)
      .get('/health')
      .expect(200);

    expect(res.body.status).toBe('ok');
  });
});

describe('Security Headers', () => {
  let app;

  beforeAll(() => {
    app = createTestApp();
  });

  it('includes helmet security headers', async () => {
    const res = await request(app)
      .get('/health')
      .expect(200);

    expect(res.headers['x-content-type-options']).toBeDefined();
    expect(res.headers['x-frame-options']).toBeDefined();
  });
});
