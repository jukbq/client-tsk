// scripts/sitemap/utils.mjs
import fs from 'fs';
import path from 'path';

export const BASE_URL = 'https://tsk.in.ua';
export const OUTPUT_DIR = path.resolve('src');

export function writeFile(name, content) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  fs.writeFileSync(path.join(OUTPUT_DIR, name), content.trim(), 'utf-8');
}

export function urlset(urls) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join('\n')}
</urlset>`;
}

export function sitemapIndex(items) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${items.join('\n')}
</sitemapindex>`;
}

export function url(loc, lastmod, priority = '0.7') {
  return `<url>
  <loc>${BASE_URL}${loc}</loc>
  <lastmod>${lastmod}</lastmod>
  <priority>${priority}</priority>
</url>`;
}

export function sitemap(loc, lastmod) {
  return `<sitemap>
  <loc>${BASE_URL}/${loc}</loc>
  <lastmod>${lastmod}</lastmod>
</sitemap>`;
}
