// scripts/sitemap/index.mjs
import { sitemapIndex, sitemap, writeFile } from './utils.mjs';

export function generateIndexSitemap(files) {
  const now = new Date().toISOString();

  const items = files.map((file) => sitemap(file, now));

  writeFile('sitemap.xml', sitemapIndex(items));
}
