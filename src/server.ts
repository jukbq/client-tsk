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

/**
 * 🤖 Обслуговування статичних файлів (robots, sitemap)
 */
app.get('/robots.txt', (req, res) => {
  const path = join(browserDistFolder, 'robots.txt');
  if (fs.existsSync(path)) {
    res.setHeader('Cache-Control', 'public, max-age=86400');
    return res.sendFile(path);
  }
  return res.status(410).send('Gone');
});

app.get('/sitemap.xml', (req, res) => {
  const path = join(browserDistFolder, 'sitemap.xml');
  if (fs.existsSync(path)) {
    res.setHeader('Cache-Control', 'public, max-age=86400');
    return res.sendFile(path);
  }
  return res.status(404).send('Not Found');
});

/**
 * 🧼 SEO FIX: Обробка кривих посилань з query-параметрами (?tag=...&id=...)
 * Ми робимо 301 редірект на чисту структуру /recipe-filte/:type/:id
 */
app.get('/recipe-filte', (req, res, next) => {
  const { tag, id } = req.query;

  if (tag && id) {
    // Формуємо чисте посилання, яке розуміє ваш роутинг Angular
    const cleanUrl = `/recipe-filte/${tag}/${id}`;
    console.log(`🔀 SEO Redirect (Old Query -> Clean URL): ${req.url} → ${cleanUrl}`);
    return res.redirect(301, cleanUrl);
  }

  // Якщо параметрів немає, просто пускаємо далі в Angular (там відпрацює 404 якщо треба)
  next();
});

// 🛑 Жорстке відсікання сміттєвих адрес, які тероризує Google
app.get(['/recipe', '/recipe/'], (req, res) => {
  console.log(`🚫 Blocking phantom route: ${req.url}`);
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  // Можна віддати 404 або редіректнути на головну. Для Google краще 410 (Gone) або 404.
  return res.status(404).send('Not Found');
});

/**
 * 🧱 Статика (JS, CSS, Зображення, Шрифти)
 */
app.use(
  express.static(browserDistFolder, {
    index: false,
    redirect: false,
    setHeaders: (res, path) => {
      // 1. Не кешуємо конфіги та сервіс-воркери
      if (
        path.endsWith('service-worker.js') ||
        path.endsWith('ngsw.json') ||
        path.endsWith('index.html')
      ) {
        res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
        return;
      }

      // 2. ШРИФТИ — Найвищий пріоритет (кешуємо на 1 рік)
      // Ми додаємо перевірку на розширення woff2, woff, ttf
      if (/\.(woff2?|ttf|otf)$/.test(path)) {
        res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
        return;
      }

      // 3. Інша статика (зображення, JS/CSS з хешами)
      if (/\.[0-9a-f]{8,}\.(js|css|png|jpg|jpeg|svg|webp)$/.test(path)) {
        res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
        return;
      }

      /**
       * 🕐 Інша статика — 1 година
       */
      if (/\.(js|css|png|jpg|jpeg|svg|webp)$/.test(path)) {
        res.setHeader('Cache-Control', 'public, max-age=3600');
        return;
      }

      // 4. Дефолт для решти (1 година)
      res.setHeader('Cache-Control', 'public, max-age=3600');
    },
  })
);

/**
 * 🚀 Angular SSR (Головний обробник)
 */
app.use((req, res, next) => {
  angularApp
    .handle(req)
    .then(async (response) => {
      if (!response) return next();

      res.setHeader('Cache-Control', 'no-store');

      // Щоб перевірити вміст сторінки на "soft-404", нам треба прочитати body.
      // Важливо: response.clone(), бо потік body можна прочитати лише один раз.
      const responseClone = response.clone();
      const html = await responseClone.text();

      // Перевіряємо ваш маркер 404 помилки в HTML коді
      if (html.includes('id="soft-404-marker"') || html.includes('404-not-found')) {
        console.warn(`⚠️ SSR: Force 404 status for ${req.originalUrl}`);

        // Створюємо нову відповідь зі статусом 404, зберігаючи контент сторінки помилки
        const forced404Response = new Response(html, {
          status: 404,
          headers: response.headers,
        });
        return writeResponseToNodeResponse(forced404Response, res);
      }

      // Якщо все ок — віддаємо стандартну відповідь (200)
      return writeResponseToNodeResponse(response, res);
    })
    .catch((err) => {
      console.error('❌ SSR Render Error:', err);
      next(err);
    });
});

/**
 * Запуск сервера
 */
if (isMainModule(import.meta.url) || process.env['pm_id']) {
  const port = Number(process.env['PORT']) || 4000;
  app.listen(port, '0.0.0.0', () => {
    console.log(`Node Express server listening on http://0.0.0.0:${port}`);
  });
}

export const reqHandler = createNodeRequestHandler(app);

