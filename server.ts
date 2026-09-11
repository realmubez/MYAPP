import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import { telegramRouter } from './server/router';
import { startPollingLoop } from './server/telegram';
import { authRouter } from './server/authRouter';
import { isAuthenticatedRequest } from './server/auth';

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

  // Mount Authentication routes
  app.use('/api/auth', authRouter);

  // Mount Telegram API routes (protected, except webhook)
  app.use(
    '/api/telegram',
    (req, res, next) => {
      if (req.path === '/webhook') {
        return next();
      }
      if (!isAuthenticatedRequest(req)) {
        return res.status(401).json({ error: 'Unauthorized. Please log in.' });
      }
      next();
    },
    telegramRouter
  );

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
    app.get('*', (req, res) => {
      // If requesting a page (not an asset) while unauthenticated, redirect to login
      const isAsset = req.path.startsWith('/assets') || req.path.includes('.');
      const isLogin = req.path === '/login';

      if (!isAsset && !isLogin && !isAuthenticatedRequest(req)) {
        const returnUrl = req.originalUrl && req.originalUrl !== '/' ? `?redirect=${encodeURIComponent(req.originalUrl)}` : '';
        return res.redirect(`/login${returnUrl}`);
      }

      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[MY LEARNING Server] running on http://localhost:${PORT}`);
    startPollingLoop();
  });
}

startServer();
