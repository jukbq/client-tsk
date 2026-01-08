// scripts/sitemap/recipes-list.mjs
import { db } from '../firebase-admin.mjs';
import { url, urlset, writeFile } from './utils.mjs';

const FALLBACK_DATE = '2025-01-01';

export async function generateRecipesListSitemap() {
  console.log('📦 Fetching recipe lists...');

  const snap = await db.collection('categoriesDishes').get();

  const urls = [];

  snap.docs.forEach((doc) => {
    const data = doc.data();

    // ID документа = slug
    const slug = doc.id;

    const lastmod = data.createdAt || FALLBACK_DATE;

    urls.push(
      url(`/recipes-list/${slug}`, lastmod)
    );
  });

  writeFile('recipes-list-sitemap.xml', urlset(urls));

  console.log(`   → recipe lists: ${urls.length}`);

  return ['recipes-list-sitemap.xml'];
}
