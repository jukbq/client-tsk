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
    if (
      req.headers['x-forwarded-proto'] &&
      req.headers['x-forwarded-proto'] !== 'https'
    ) {
      return res.redirect(301, `https://${req.headers.host}${req.url}`);
    }
    // Якщо заголовку немає — не редіректимо (Firebase може проксити)
    next();
  });

  // 🤖 robots.txt і sitemap.xml (з кешем 1 день)
  server.get('/robots.txt', (req, res) => {
    const path = join(browserDistFolder, 'robots.txt');
    if (fs.existsSync(path)) {
      res.setHeader('Cache-Control', 'public, max-age=86400'); // 1 day
      return res.sendFile(path);
    }
    return res.status(404).send('Not Found');
  });

  server.get('/sitemap.xml', (req, res) => {
    const path = join(browserDistFolder, 'sitemap.xml');
    if (fs.existsSync(path)) {
      res.setHeader('Cache-Control', 'public, max-age=86400'); // 1 day
      return res.sendFile(path);
    }
    return res.status(404).send('Not Found');
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

  // -----------------------
  //  Статика — з контролем заголовків
  // -----------------------
  // Використовуємо express.static як middleware і setHeaders для контролю кешу
  server.use(
    express.static(browserDistFolder, {
      index: false, // щоб не віддавати index.html для asset-запитів автоматично
      immutable: true,
      maxAge: '1y',
      setHeaders: (res, filePath) => {
        // 1) service-worker.js або ngsw.json - не кешувати довго, щоб оновлення доставилось швидко
        if (
          filePath.endsWith('service-worker.js') ||
          filePath.endsWith('ngsw.json')
        ) {
          res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
          return;
        }

        // 2) index.html — ніколи не кешувати (щоб браузер швидко отримував нові хеші)
        if (filePath.endsWith('index.html')) {
          res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
          return;
        }

        // 3) для хешованих файлів (js/css/img) — довгий кеш (immutable)
        if (
          /\.[0-9a-f]{8,}\.(js|css|png|jpg|jpeg|svg|webp|woff2?)$/.test(
            filePath
          ) ||
          /-([0-9a-f]{6,})\.(js|css)$/.test(filePath) ||
          filePath.match(/\.(js|css|png|jpg|jpeg|svg|webp|woff2?)$/)
        ) {
          res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
          return;
        }

        // default fallback
        res.setHeader('Cache-Control', 'public, max-age=3600');
      },
    })
  );

  // 🧱 Статика
  server.get(
    '**',
    express.static(browserDistFolder, {
      maxAge: '1y',
      index: 'index.html',
    })
  );

  // 🚫 API заглушка
  server.get('/api/**', (req, res) => {
    res.setHeader(
      'Cache-Control',
      'no-store, no-cache, must-revalidate, proxy-revalidate'
    );
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    res.status(404).send('API not implemented');
  });

  // -----------------------
  //  Angular SSR (catch-all)
  // -----------------------
  server.get('**', (req, res, next) => {
    // Визначаємо "публічний" хост у пріоритеті:
    // 1) якщо проксі передав X-Forwarded-Host — використовуємо його,
    // 2) інакше беремо env APP_HOST (можна прописати в deployment: tsk.in.ua),
    // 3) інакше стандартний req.headers.host
    const forwardedHost = (req.headers['x-forwarded-host'] as string) || null;
    const originHost =
      forwardedHost ||
      process.env['APP_HOST'] ||
      (req.headers.host as string) ||
      'tsk.in.ua';
    const origin = `${req.protocol}://${originHost}`;

    const renderUrl = `${origin}${req.originalUrl}`;

    commonEngine
      .render({
        bootstrap,
        documentFilePath: indexHtml,
        url: renderUrl,
        publicPath: browserDistFolder,
        providers: [
          { provide: APP_BASE_HREF, useValue: req.baseUrl },
          { provide: RESPONSE, useValue: res },
        ],
      })
      .then((html) => {
        res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');

        if (html.includes('id="soft-404-marker"')) {
          console.warn(`⚠️ SSR DETECTED 404 FOR ${req.originalUrl}`);
          return res.status(404).send(html);
        } else {
          return res.status(200).send(html);
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
              { provide: RESPONSE, useValue: res },
            ],
          });
          res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
          return res.status(404).send(html);
        }

        console.error('❌ SSR error:', err);
        try {
          res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
          return res
            .status(200)
            .sendFile(join(browserDistFolder, 'index.html'));
        } catch (sendErr) {
          console.error('❌ Fallback send failed:', sendErr);
          res.status(500).send('Internal Server Error');
        }
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
