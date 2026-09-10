import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import { telegramRouter } from './server/router';
import { startPollingLoop } from './server/telegram';

// Load local environment variables if available
dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Parse JSON request bodies
  app.use(express.json());

  // API routes FIRST
  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok' });
  });

  // Mount Telegram API routes
  app.use('/api/telegram', telegramRouter);

  // Vite middleware for development vs static build in production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[MY LEARNING Server] running on http://localhost:${PORT}`);
    startPollingLoop();
  });
}

startServer();
