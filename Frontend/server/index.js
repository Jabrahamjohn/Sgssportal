import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

import { router } from './base.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const TRUST_PROXY = process.env.TRUST_PROXY && !isNaN(+process.env.TRUST_PROXY) ? +process.env.TRUST_PROXY : 0;

const app = express();

// Rate Limiter
app.set('trust proxy', TRUST_PROXY);

// Middleware
app.use(express.json());

// Serve static files from Vite's build output directory
app.use(express.static(path.join(__dirname, '../dist')));

app.use(router);

// Handle all other routes by serving the frontend (index.html)
app.get('*', (_req, res) => {
  res.sendFile(path.resolve(__dirname, '../dist', 'index.html'));
});

// Set up the server to listen on a port
const PORT = process.env.SERVER_TARGET_PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
