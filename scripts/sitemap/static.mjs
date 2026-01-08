// scripts/sitemap/static.mjs
import { url, urlset, writeFile } from './utils.mjs';

const LASTMOD = '2025-06-01'; // фіксовано і чесно

export function generateStaticSitemap() {
  const urls = [
    url('/', LASTMOD, '1.0'),
    url('/dishes', LASTMOD),
    url('/about-us', LASTMOD),
    url('/kontakty', LASTMOD),
    url('/articlses', LASTMOD),
  ];

  writeFile('static-sitemap.xml', urlset(urls));
}
