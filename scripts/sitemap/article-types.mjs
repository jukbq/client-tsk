import { db } from '../firebase-admin.mjs';
import { url, urlset, writeFile } from './utils.mjs';

const FALLBACK_DATE = '2025-01-01';

export async function generateArticleTypesSitemap() {
  console.log('📦 Fetching article types...');

  const snap = await db.collection('article-type').get();

  const urls = snap.docs.map((doc) => {
    const createdAt = doc.data().createdAt || FALLBACK_DATE;
    return url(`/article-categories/${doc.id}`, createdAt);
  });

  writeFile('article-type-sitemap.xml', urlset(urls));

  console.log(`   → article types: ${urls.length}`);

  return ['article-type-sitemap.xml'];
}
