import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import http from 'http';
import https from 'https';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3000;

const distPath = path.join(__dirname, 'dist');
const BACKEND_URL = process.env.VITE_API_URL || 'https://decisions-backend.onrender.com';

console.log(`[Server] Backend URL: ${BACKEND_URL}`);
console.log(`[Server] distPath: ${distPath}`);

app.use(express.json());

// API proxy - forward /api requests to backend
app.use('/api', (req, res) => {
  const backendUrl = `${BACKEND_URL}${req.path}`;
  console.log(`[Proxy] ${req.method} ${req.path} -> ${backendUrl}`);

  const options = {
    method: req.method,
    headers: {
      'Content-Type': 'application/json',
      ...req.headers,
    },
  };

  delete options.headers.host;

  const protocol = backendUrl.startsWith('https') ? https : http;
  const proxyReq = protocol.request(backendUrl, options, (proxyRes) => {
    res.writeHead(proxyRes.statusCode, proxyRes.headers);
    proxyRes.pipe(res);
  });

  proxyReq.on('error', (err) => {
    console.error(`[Proxy] Error: ${err.message}`);
    res.status(502).json({ error: 'Backend unavailable' });
  });

  if (req.method !== 'GET' && req.method !== 'HEAD') {
    req.pipe(proxyReq);
  } else {
    proxyReq.end();
  }
});

app.use(express.static(distPath));

app.get('*', (req, res) => {
  const indexPath = path.join(distPath, 'index.html');
  console.log(`[Server] Serving index.html from ${indexPath}`);
  res.sendFile(indexPath);
});

app.listen(PORT, () => {
  console.log(`[Server] Server running on port ${PORT}`);
});
