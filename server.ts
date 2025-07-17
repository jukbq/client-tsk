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
        // 🧠 Якщо в HTML є маркери 404-сторінки — віддаємо 404 статус
        if (html.includes('id="soft-404-marker"')) {
          console.warn(`⚠️ SSR DETECTED 404 FOR ${req.originalUrl}`);
          res.status(404).send(html);
        }
        else {
          res.status(200).send(html);
        }
      })
      .catch(async (err) => {
        if (err?.message === 'NotFound') {
          console.warn(`⚠️ SSR DETECTED 404 ERROR FOR ${req.originalUrl}`);
          const html = await commonEngine.render({
            bootstrap,
            documentFilePath: indexHtml,
            url: '/404',
            publicPath: browserDistFolder,
            providers: [
              { provide: APP_BASE_HREF, useValue: req.baseUrl },
              { provide: RESPONSE, useValue: res }
            ],
          });
          return res.status(404).send(html);
        }

        console.error('❌ SSR error:', err);
        res.status(500).send('Internal Server Error');
        next(err);
        return;
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
