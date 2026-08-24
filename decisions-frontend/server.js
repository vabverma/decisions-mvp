import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3000;

const distPath = path.join(__dirname, 'dist');
console.log(`[Server] __dirname: ${__dirname}`);
console.log(`[Server] distPath: ${distPath}`);
console.log(`[Server] dist exists: ${fs.existsSync(distPath)}`);
console.log(`[Server] index.html exists: ${fs.existsSync(path.join(distPath, 'index.html'))}`);

app.use(express.static(distPath));

app.get('*', (req, res) => {
  const indexPath = path.join(distPath, 'index.html');
  console.log(`[Server] Serving index.html from ${indexPath}`);
  res.sendFile(indexPath);
});

app.listen(PORT, () => {
  console.log(`[Server] Server running on port ${PORT}`);
});
