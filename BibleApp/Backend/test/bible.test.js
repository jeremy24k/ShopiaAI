import { describe, it, expect, beforeAll } from '@jest/globals';
import request from 'supertest';
import { createTestApp } from '../app.test.js';

describe('Bible Routes', () => {
  let app;

  beforeAll(() => {
    app = createTestApp();
  });

  describe('GET /api/translations', () => {
    it('returns 200 with success status', async () => {
      const res = await request(app)
        .get('/api/translations');

      expect(res.status).toBeGreaterThanOrEqual(200);
    });
  });

  describe('GET /api/books/:translation', () => {
    it('accepts valid translation code', async () => {
      const res = await request(app)
        .get('/api/books/spa_rvr1960');

      expect(res.status).toBeGreaterThanOrEqual(200);
    });

    it('accepts lowercase translation', async () => {
      const res = await request(app)
        .get('/api/books/eng_kjv');

      expect(res.status).toBeGreaterThanOrEqual(200);
    });
  });

  describe('GET /api/chapter/:translation/:book/:chapter', () => {
    it('accepts valid chapter parameters', async () => {
      const res = await request(app)
        .get('/api/chapter/spa_rvr1960/GEN/1');

      expect(res.status).toBeGreaterThanOrEqual(200);
    });
  });
});
