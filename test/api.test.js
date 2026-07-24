const request = require('supertest');
const app = require('../src/app');
const store = require('../src/store');

describe('URL Shortener API Integration Tests', () => {
  beforeEach(async () => {
    await store.clear();
  });

  describe('GET /health', () => {
    test('should return 200 and health status', async () => {
      const response = await request(app).get('/health');
      expect(response.body.status).toBe('ok');
      expect(response.body).toHaveProperty('version');
    });
  });

  describe('POST /shorten', () => {
    test('should create a short URL for a valid original URL', async () => {
      const response = await request(app)
        .post('/shorten')
        .send({ url: 'https://github.com/google/antigravity' });
      
      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('shortCode');
      expect(response.body).toHaveProperty('shortUrl');
      expect(response.body.shortCode).toMatch(/^[a-zA-Z0-9]{6}$/);
      expect(response.body.shortUrl).toContain(response.body.shortCode);
    });

    test('should reject invalid URL with 400', async () => {
      const response = await request(app)
        .post('/shorten')
        .send({ url: 'invalid-url' });
      
      expect(response.status).toBe(400);
      expect(response.body).toEqual({ error: 'Invalid URL' });
    });

    test('should reject missing URL with 400', async () => {
      const response = await request(app)
        .post('/shorten')
        .send({});
      
      expect(response.status).toBe(400);
      expect(response.body).toEqual({ error: 'Invalid URL' });
    });
  });

  describe('GET /:code', () => {
    test('should redirect (302) to original URL for valid short code', async () => {
      const targetUrl = 'https://google.com';
      const shortenResponse = await request(app)
        .post('/shorten')
        .send({ url: targetUrl });
      
      const code = shortenResponse.body.shortCode;
      
      const response = await request(app).get(`/${code}`);
      expect(response.status).toBe(302);
      expect(response.headers.location).toBe(targetUrl);
    });

    test('should return 404 for unknown short code', async () => {
      const response = await request(app).get('/nonexistentcode');
      expect(response.status).toBe(404);
      expect(response.body).toEqual({ error: 'Short URL not found' });
    });
  });
});
