const store = new Map();

module.exports = {
  saveUrl: async (code, originalUrl) => {
    store.set(code, originalUrl);
    return { code, originalUrl };
  },
  getUrl: async (code) => {
    return store.get(code) || null;
  },
  hasCode: async (code) => {
    return store.has(code);
  },
  clear: async () => {
    store.clear();
  }
};
