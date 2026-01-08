// scripts/sitemap/recipes.mjs
import { db } from '../firebase-admin.mjs';
import { url, urlset, writeFile } from './utils.mjs';

const PAGE_SIZE = 500;

export async function generateRecipeSitemaps() {

  console.log('📦 Fetching recipes...');
  
  const snap = await db.collection('short-recipes').get();

  console.log(`   → recipes total: ${snap.size}`);

  const urls = snap.docs.map((doc) => {
    const createdAt = doc.data().createdAt || '2025-01-01';
    return url(`/recipe-page/${doc.id}`, createdAt);
  });

  const chunks = [];
  for (let i = 0; i < urls.length; i += PAGE_SIZE) {
    chunks.push(urls.slice(i, i + PAGE_SIZE));
  }

  chunks.forEach((chunk, index) => {
    const name =
      index === 0
        ? 'recipe-page-sitemap.xml'
        : `recipe-page-${index + 1}-sitemap.xml`;

    writeFile(name, urlset(chunk));
  });

  console.log(`   → recipe sitemaps: ${chunks.length}`);

  return chunks.map((_, i) =>
    i === 0
      ? 'recipe-page-sitemap.xml'
      : `recipe-page-${i + 1}-sitemap.xml`
  );
}
