// Client-side only server - bypass TanStack Start SSR
import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

async function startServer() {
  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: 'spa',
    root: __dirname
  });

  app.use(vite.middlewares);

  // Serve static assets
  app.use('/assets', express.static(path.join(__dirname, 'dist/assets')));

  // Handle all other routes with SPA fallback
  app.use('*', async (req, res, next) => {
    const url = req.originalUrl;
    
    // Skip if it's an API request or static asset
    if (url.startsWith('/api') || url.includes('.')) {
      return next();
    }
    
    try {
      let template = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <title>MobiExpress</title>
          <script type="module" src="/src/main.tsx"></script>
        </head>
        <body>
          <div id="root"></div>
        </body>
        </html>
      `;
      
      template = await vite.transformIndexTemplate(url, template);
      res.status(200).set({ 'Content-Type': 'text/html' }).end(template);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      console.error(e);
      res.status(500).end(e.message);
    }
  });

  app.listen(8080, () => {
    console.log('Client-side server running on http://localhost:8080');
  });
}

startServer().catch(console.error);
