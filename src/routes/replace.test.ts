import request from 'supertest';
import express, { Express } from 'express';
import { replaceHandler } from './replace';

// Mock the config to control maxReplacements
jest.mock('../config', () => ({
  loadConfig: jest.fn(() => ({ maxReplacements: 100, port: 3000 })),
}));

describe('POST /replace endpoint', () => {
  let app: Express;

  beforeEach(() => {
    app = express();
    app.use(express.json({ limit: '10mb' }));
    app.post('/replace', replaceHandler);
  });

  describe('Core functionality', () => {
    it('should replace "dog" with "cat" in simple string', async () => {
      // Note: Express JSON parser requires objects/arrays, so we wrap primitives
      // In real usage, clients would send valid JSON which can include string primitives
      // For testing, we'll test with objects that contain the string
      const response = await request(app)
        .post('/replace')
        .send({ value: 'dog' })
        .expect(200);

      expect(response.body.data).toEqual({ value: 'cat' });
      expect(response.body.replacements).toBe(1);
    });

    it('should replace "dog" with "cat" in object', async () => {
      const response = await request(app)
        .post('/replace')
        .send({ pet: 'dog', name: 'Max' })
        .expect(200);

      expect(response.body.data).toEqual({ pet: 'cat', name: 'Max' });
      expect(response.body.replacements).toBe(1);
    });

    it('should replace multiple occurrences', async () => {
      const response = await request(app)
        .post('/replace')
        .send({ pet1: 'dog', pet2: 'dog', other: 'value' })
        .expect(200);

      expect(response.body.data).toEqual({ pet1: 'cat', pet2: 'cat', other: 'value' });
      expect(response.body.replacements).toBe(2);
    });

    it('should handle arrays', async () => {
      const response = await request(app)
        .post('/replace')
        .send(['dog', 'puppy', 'dog'])
        .expect(200);

      expect(response.body.data).toEqual(['cat', 'puppy', 'cat']);
      expect(response.body.replacements).toBe(2);
    });

    it('should handle nested structures', async () => {
      const response = await request(app)
        .post('/replace')
        .send({
          level1: {
            level2: {
              value: 'dog',
            },
          },
        })
        .expect(200);

      expect((response.body.data as any).level1.level2.value).toBe('cat');
      expect(response.body.replacements).toBe(1);
    });
  });

  describe('Replacement limits', () => {
    it('should return error when limit is exceeded', async () => {
      const { loadConfig } = require('../config');
      loadConfig.mockReturnValue({ maxReplacements: 5, port: 3000 });

      const input = Array(6).fill('dog');
      const response = await request(app)
        .post('/replace')
        .send(input)
        .expect(400);

      expect(response.body.error).toBe('Replacement limit exceeded');
      expect(response.body.replacements).toBe(6);
      expect(response.body.limit).toBe(5);
    });

    it('should allow replacements up to the limit', async () => {
      const { loadConfig } = require('../config');
      loadConfig.mockReturnValue({ maxReplacements: 10, port: 3000 });

      const input = Array(10).fill('dog');
      const response = await request(app)
        .post('/replace')
        .send(input)
        .expect(200);

      expect(response.body.replacements).toBe(10);
    });
  });

  describe('Invalid JSON', () => {
    it('should return 400 for invalid JSON', async () => {
      const response = await request(app)
        .post('/replace')
        .set('Content-Type', 'application/json')
        .send('invalid json{')
        .expect(400);

      // Express JSON parser will catch this and return 400
      expect(response.body.error || response.status).toBeDefined();
    });

    it('should handle empty object as valid JSON', async () => {
      const response = await request(app)
        .post('/replace')
        .send({})
        .expect(200);

      expect(response.body.data).toEqual({});
      expect(response.body.replacements).toBe(0);
    });
  });

  describe('Edge cases', () => {
    it('should handle null JSON value', async () => {
      // JSON null is a valid value, so it should be processed
      // Note: Express json() middleware may not parse null directly, so we test with object
      const response = await request(app)
        .post('/replace')
        .send({ value: null })
        .expect(200);

      expect((response.body.data as any).value).toBeNull();
      expect(response.body.replacements).toBe(0);
    });

    it('should handle empty object', async () => {
      const response = await request(app)
        .post('/replace')
        .send({})
        .expect(200);

      expect(response.body.data).toEqual({});
      expect(response.body.replacements).toBe(0);
    });

    it('should handle empty array', async () => {
      const response = await request(app)
        .post('/replace')
        .send([])
        .expect(200);

      expect(response.body.data).toEqual([]);
      expect(response.body.replacements).toBe(0);
    });

    it('should handle large payloads', async () => {
      const largeArray = Array(1000).fill('puppy');
      largeArray[500] = 'dog';

      const response = await request(app)
        .post('/replace')
        .send(largeArray)
        .expect(200);

      expect(response.body.replacements).toBe(1);
      expect((response.body.data as string[])[500]).toBe('cat');
    });

    it('should handle deeply nested structures', async () => {
      let nested: any = 'dog';
      for (let i = 0; i < 10; i++) {
        nested = { level: nested };
      }

      const response = await request(app)
        .post('/replace')
        .send(nested)
        .expect(200);

      let current: any = response.body.data;
      for (let i = 0; i < 10; i++) {
        current = current.level;
      }
      expect(current).toBe('cat');
      expect(response.body.replacements).toBe(1);
    });
  });

  describe('Response format', () => {
    it('should return correct response structure', async () => {
      const response = await request(app)
        .post('/replace')
        .send({ pet: 'dog' })
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('replacements');
      expect(typeof response.body.replacements).toBe('number');
    });
  });
});

