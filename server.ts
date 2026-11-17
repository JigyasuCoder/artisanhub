import express from 'express';
import mongoose from 'mongoose';
import path from 'path';
import { fileURLToPath } from 'url';
import app, { ensureMongoReady } from './lib/app.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PORT = Number(process.env.PORT) || 3000;

// Keep persistent Atlas connection alive only when MONGO_URI is configured
if (process.env.MONGO_URI) {
  ensureMongoReady().catch(() => {});
  setInterval(() => {
    if (mongoose.connection.readyState === 0) {
      ensureMongoReady().catch(() => {});
    }
  }, 5000);
}

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('/{*splat}', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`✨ ArtisanHub Full-Stack Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
