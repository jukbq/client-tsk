import { db } from '../firebase-admin.mjs';
import { url, urlset, writeFile } from './utils.mjs';

const FALLBACK_DATE = '2025-01-01';

export async function generateArticleCategoriesSitemap() {
  console.log('📦 Fetching article categories...');

  const snap = await db.collection('article-category').get();

  const urls = snap.docs.map((doc) => {
    const createdAt = doc.data().createdAt || FALLBACK_DATE;
    return url(`/article-list/${doc.id}`, createdAt);
  });

  writeFile('article-category-sitemap.xml', urlset(urls));
  return ['article-category-sitemap.xml'];
}
