import {
  AngularNodeAppEngine,
  createNodeRequestHandler,
  isMainModule,
  writeResponseToNodeResponse,
} from '@angular/ssr/node';
import express from 'express';
import { join } from 'node:path';
import compression from 'compression';
import fs from 'fs';

const browserDistFolder = join(import.meta.dirname, '../browser');

const app = express();
app.use(compression({ threshold: 0 }));
const angularApp = new AngularNodeAppEngine();

// 🤖 robots.txt і sitemap.xml (з кешем 1 день)
app.get('/robots.txt', (req, res) => {
  const path = join(browserDistFolder, 'robots.txt');
  if (fs.existsSync(path)) {
    res.setHeader('Cache-Control', 'public, max-age=86400'); // 1 day
    return res.sendFile(path);
  }
  return res.status(404).send('Not Found');
});

app.get('/sitemap.xml', (req, res) => {
  const path = join(browserDistFolder, 'sitemap.xml');
  if (fs.existsSync(path)) {
    res.setHeader('Cache-Control', 'public, max-age=86400'); // 1 day
    return res.sendFile(path);
  }
  return res.status(404).send('Not Found');
});



/**
 * Example Express Rest API endpoints can be defined here.
 * Uncomment and define endpoints as necessary.
 *
 * Example:
 * ```ts
 * app.get('/api/{*splat}', (req, res) => {
 *   // Handle API request
 * });
 * ```
 */

/**
 * Serve static files from /browser
 */
app.use(
  express.static(browserDistFolder, {
    index: false,
    redirect: false,
    setHeaders: (res, path) => {
      if (path.endsWith('service-worker.js') || path.endsWith('ngsw.json')) {
        res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
        return;
      }
      if (path.endsWith('index.html')) {
        res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
        return;
      }
      if (
        /\.[0-9a-f]{8,}\.(js|css|png|jpg|jpeg|svg|webp|woff2?)$/.test(path) ||
        /-([0-9a-f]{6,})\.(js|css)$/.test(path) ||
        path.match(/\.(js|css|png|jpg|jpeg|svg|webp|woff2?)$/)
      ) {
        res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
        return;
      }
      res.setHeader('Cache-Control', 'public, max-age=3600');
    },
  })
);


/**
 * Handle all other requests by rendering the Angular application.
 */
app.use((req, res, next) => {
  angularApp
    .handle(req)
    .then((response) => (response ? writeResponseToNodeResponse(response, res) : next()))
    .catch(next);
});

/**
 * Start the server if this module is the main entry point, or it is ran via PM2.
 * The server listens on the port defined by the `PORT` environment variable, or defaults to 4000.
 */
if (isMainModule(import.meta.url) || process.env['pm_id']) {
  const port = process.env['PORT'] || 4000;
  app.listen(port, (error) => {
    if (error) {
      throw error;
    }

    console.log(`Node Express server listening on http://localhost:${port}`);
  });
}

/**
 * Request handler used by the Angular CLI (for dev-server and during build) or Firebase Cloud Functions.
 */
export const reqHandler = createNodeRequestHandler(app);
