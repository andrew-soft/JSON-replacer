import request from 'supertest';
import { Express } from 'express';
import { createApp } from './index';

// Mock config
jest.mock('./config', () => ({
  loadConfig: jest.fn(() => ({ maxReplacements: 100, port: 3000 })),
}));

describe('Express app', () => {
  let app: Express;

  beforeEach(() => {
    app = createApp();
  });

  describe('Health check', () => {
    it('should return 200 for /health', async () => {
      const response = await request(app).get('/health').expect(200);
      expect(response.body).toEqual({ status: 'ok' });
    });
  });

  describe('404 handling', () => {
    it('should return 404 for unknown routes', async () => {
      const response = await request(app).get('/unknown').expect(404);
      expect(response.body.error).toBe('Not found');
    });

    it('should return 404 for POST to unknown routes', async () => {
      const response = await request(app).post('/unknown').expect(404);
      expect(response.body.error).toBe('Not found');
    });
  });

  describe('Error handling', () => {
    it('should handle JSON parse errors gracefully', async () => {
      const response = await request(app)
        .post('/replace')
        .set('Content-Type', 'application/json')
        .send('{ invalid json }')
        .expect(400);

      expect(response.body.error).toBeDefined();
    });
  });
});

