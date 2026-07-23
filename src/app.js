const express = require('express');
const store = require('./store');
const { isValidUrl, generateShortCode } = require('./urlUtils');

const app = express();
app.use(express.json());

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', version: '1.0.0' });
});

app.post('/shorten', async (req, res) => {
  const { url } = req.body;
  
  if (!url || !isValidUrl(url)) {
    return res.status(400).json({ error: 'Invalid URL' });
  }

  let code;
  let attempts = 0;
  const maxAttempts = 10;
  
  // Collision prevention loop
  while (attempts < maxAttempts) {
    code = generateShortCode(6);
    if (!(await store.hasCode(code))) {
      break;
    }
    attempts++;
  }

  if (attempts === maxAttempts) {
    return res.status(500).json({ error: 'Failed to generate unique short code' });
  }

  await store.saveUrl(code, url);

  const host = req.get('host');
  const shortUrl = `${req.protocol}://${host}/${code}`;

  res.status(201).json({
    shortCode: code,
    shortUrl
  });
});

app.get('/:code', async (req, res) => {
  const { code } = req.params;
  const url = await store.getUrl(code);
  
  if (!url) {
    return res.status(404).json({ error: 'Short URL not found' });
  }

  res.redirect(302, url);
});

module.exports = app;
