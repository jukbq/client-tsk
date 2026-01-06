console.log('ENV CHECK', {
  creds: process.env.GOOGLE_APPLICATION_CREDENTIALS,
  project: process.env.GOOGLE_CLOUD_PROJECT,
});

console.log('🔥🔥🔥 generate-sitemap.mjs LOADED 🔥🔥🔥');

// 🚧 STOP для локалки і build
if (process.env.NODE_ENV !== 'production') {
  console.log('⏭️ Sitemap generation skipped (not production)');
  process.exit(0);
}


// scripts/generate-sitemap.mjs
import fs from 'fs';
import path from 'path';
import { db } from './firebase-admin.mjs';

const BASE_URL = 'https://tsk.in.ua';
const OUTPUT_PATH = path.resolve('dist/client-tsk/browser/sitemap.xml');

async function generateSitemap() {
  console.log('🔍 Generating sitemap...');

  /** 
   * Використовуємо Set, щоб:
   * – не було дублів
   * – не трахатись з перевірками
   */
  const urls = new Set();

  // =====================================================
  // 🧱 СТАТИЧНІ SEO-СТОРІНКИ (РУЧНИЙ WHITELIST)
  // =====================================================
  urls.add('/');
  urls.add('/dishes');
  urls.add('/about-us');
  urls.add('/kontakty');
  urls.add('/articlses');

  // ❌ СВІДОМО НЕ ДОДАЄМО:
  // /privacyy
  // /umovy-korystuvannya
  // /auth
  // /profile
  // /search
  // /recipe-filte/*

  // =====================================================
  // 🍲 РЕЦЕПТИ
  // /recipe-page/:recipeid
  // =====================================================
  console.log('📦 Fetching recipes...');
  const recipesSnap = await db.collection('short-recipes').get();

  recipesSnap.docs.forEach((doc) => {
    urls.add(`/recipe-page/${doc.id}`);
  });

  console.log(`   → recipes: ${recipesSnap.size}`);

  // =====================================================
  // 🗂️ КАТЕГОРІЇ СТРАВ
  // /categories/:dishesid
  // =====================================================
  console.log('📦 Fetching dish categories...');
  const categoriesSnap = await db.collection('dishes').get();

  categoriesSnap.docs.forEach((doc) => {
    urls.add(`/categories/${doc.id}`);
  });

  console.log(`   → categories: ${categoriesSnap.size}`);

  // =====================================================
  // 📜 СПИСКИ РЕЦЕПТІВ
  // /recipes-list/:slug
  // =====================================================
  console.log('📦 Fetching recipe lists...');
  const recipeListsSnap = await db.collection('categoriesDishes').get();

    recipeListsSnap.docs.forEach((doc) => {
    urls.add(`/recipes-list/${doc.id}`);
  });

/*   recipeListsSnap.docs.forEach((doc) => {
    const data = doc.data();
    if (data?.categoryId) {
      urls.add(`/recipes-list/${data.categoryId}`);
    }
  }); */

  console.log(`   → recipe lists: ${recipeListsSnap.size}`);

  // =====================================================
  // 🧾 ГЕНЕРАЦІЯ XML
  // =====================================================
  const now = new Date().toISOString();

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${[...urls]
  .map(
    (url) => `
  <url>
    <loc>${BASE_URL}${url}</loc>
    <lastmod>${now}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>${url === '/' ? '1.0' : '0.7'}</priority>
  </url>`
  )
  .join('')}
</urlset>`;

  // =====================================================
  // 💾 ЗАПИС ФАЙЛУ
  // =====================================================
  fs.mkdirSync(path.dirname(OUTPUT_PATH), { recursive: true });
  fs.writeFileSync(OUTPUT_PATH, xml.trim(), 'utf-8');

  console.log('✅ sitemap.xml generated');
  console.log(`📍 ${OUTPUT_PATH}`);
  console.log(`🔗 URLs total: ${urls.size}`);
}

generateSitemap().catch((err) => {
  console.error('❌ Sitemap generation failed');
  console.error(err);
  process.exit(1);
});
