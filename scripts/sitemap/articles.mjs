import { db } from '../firebase-admin.mjs';
import { url, urlset, writeFile } from './utils.mjs';

const FALLBACK_DATE = '2025-01-01';

export async function generateArticlePagesSitemap() {
  console.log('📦 Fetching article pages...');

  const snap = await db.collection('article-pages').get();

  const urls = snap.docs.map((doc) => {
    const createdAt = doc.data().createdAt || FALLBACK_DATE;
    return url(`/article-page/${doc.id}`, createdAt);
  });

  writeFile('article-page-sitemap.xml', urlset(urls));

  console.log(`   → article pages: ${urls.length}`);

  return ['article-page-sitemap.xml'];
}
