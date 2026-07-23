const store = require('../src/store');
const { generateShortCode } = require('../src/urlUtils');

describe('URL Store & Uniqueness Unit Tests', () => {
  beforeEach(async () => {
    await store.clear();
  });

  test('should store and retrieve URL correctly', async () => {
    await store.saveUrl('abc123', 'https://example.com');
    expect(await store.getUrl('abc123')).toBe('https://example.com');
  });

  test('should return null for non-existent codes', async () => {
    expect(await store.getUrl('nonexistent')).toBeNull();
  });

  test('should return correct hasCode values', async () => {
    expect(await store.hasCode('abc123')).toBe(false);
    await store.saveUrl('abc123', 'https://example.com');
    expect(await store.hasCode('abc123')).toBe(true);
  });

  test('should generate unique short codes and avoid collision (distribution check)', async () => {
    const codes = new Set();
    const count = 1000;
    for (let i = 0; i < count; i++) {
      const code = generateShortCode(6);
      expect(code).toMatch(/^[a-zA-Z0-9]{6}$/);
      codes.add(code);
    }
    // With 62^6 combinations, 1000 codes generated sequentially should not collide.
    expect(codes.size).toBe(count);
  });
});
