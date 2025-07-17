import { APP_BASE_HREF } from '@angular/common';
import { CommonEngine } from '@angular/ssr';
import express from 'express';
import { fileURLToPath } from 'node:url';
import { dirname, join, resolve } from 'node:path';
import bootstrap from './src/main.server';
import fs from 'fs';
import compression from 'compression';
import { RESPONSE } from './src/express.tokens';

export function app(): express.Express {
  const server = express();
  server.use(compression({ threshold: 0 }));

  const serverDistFolder = dirname(fileURLToPath(import.meta.url));
  const browserDistFolder = resolve(serverDistFolder, '../browser');
  const indexHtml = join(serverDistFolder, 'index.server.html');

  const commonEngine = new CommonEngine();

  server.set('view engine', 'html');
  server.set('views', browserDistFolder);

  // 🔐 HTTPS редірект
  server.use((req, res, next) => {
    if (req.headers['x-forwarded-proto'] !== 'https') {
      return res.redirect(301, `https://${req.headers.host}${req.url}`);
    }
    next();
  });

  // 🤖 robots.txt і sitemap.xml
  server.get('/robots.txt', (req, res) => {
    const path = join(browserDistFolder, 'robots.txt');
    fs.existsSync(path)
      ? res.setHeader('Cache-Control', 'public, max-age=86400') && res.sendFile(path)
      : res.status(404).send('Not Found');
  });

  server.get('/sitemap.xml', (req, res) => {
    const path = join(browserDistFolder, 'sitemap.xml');
    fs.existsSync(path)
      ? res.setHeader('Cache-Control', 'public, max-age=86400') && res.sendFile(path)
      : res.status(404).send('Not Found');
  });

  // 🧼 Стара версія recipe-filte з query
  server.get('/recipe-filte', (req, res, next) => {
    const { tag, id } = req.query;

    if (tag && id) {
      const cleanUrl = `/recipe-filte/${tag}/${id}`;
      console.log(`🔀 Редірект з ${req.url} → ${cleanUrl}`);
      return res.redirect(301, cleanUrl);
    }

    return res.status(404).send('Not Found');
  });

  // 🧱 Статика
  server.get('**', express.static(browserDistFolder, {
    maxAge: '1y',
    index: 'index.html',
  }));

  // 🚫 API заглушка
  server.get('/api/**', (req, res) => {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    res.status(404).send('API not implemented');
  });

  // 🧠 Angular SSR з перевіркою на 404
  server.get('**', (req, res, next) => {
    commonEngine
      .render({
        bootstrap,
        documentFilePath: indexHtml,
        url: `${req.protocol}://${req.headers.host}${req.originalUrl}`,
        publicPath: browserDistFolder,
        providers: [
          { provide: APP_BASE_HREF, useValue: req.baseUrl },
          { provide: RESPONSE, useValue: res }
        ],
      })
      .then((html) => {
        const is404 = html.includes('id="soft-404-marker"');
        if (is404) console.warn(`⚠️ SSR SOFT404 for ${req.originalUrl}`);
        // 🔴 Не робимо res.status(404) — навпаки завжди 200
        res.status(200).send(html);
      })
      .catch((err) => {
        console.error('❌ SSR error:', err);
        res.status(500).send('Internal Server Error');
        next(err);
      });
  });

  return server;
}

function run(): void {
  const port = process.env['PORT'] || 4000;
  const server = app();
  server.listen(port, () => {
    console.log(`🚀 Сервер слухає на http://localhost:${port}`);
  });
}

run();
