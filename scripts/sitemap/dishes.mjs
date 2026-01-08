// scripts/sitemap/dishes.mjs
import { db } from '../firebase-admin.mjs';
import { url, urlset, writeFile } from './utils.mjs';

const FALLBACK_DATE = '2025-01-01';

export async function generateDishesSitemap() {
  console.log('📦 Fetching dishes categories...');

  const snap = await db.collection('dishes').get();

  const urls = [];

  snap.docs.forEach((doc) => {
    const data = doc.data();

    // ID документа = slug
    const slug = doc.id;

    const lastmod = data.createdAt || FALLBACK_DATE;

    urls.push(
      url(`/categories/${slug}`, lastmod)
    );
  });

  writeFile('dishes-sitemap.xml', urlset(urls));

  console.log(`   → dishes categories: ${urls.length}`);

  return ['dishes-sitemap.xml'];
}
