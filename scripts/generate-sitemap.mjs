import { generateStaticSitemap } from './sitemap/static.mjs';
import { generateRecipeSitemaps } from './sitemap/recipes.mjs';
import { generateIndexSitemap } from './sitemap/index.mjs';
import { generateDishesSitemap } from './sitemap/dishes.mjs';
import { generateRecipesListSitemap } from './sitemap/recipes-list.mjs';
import { generateArticleTypesSitemap } from './sitemap/article-types.mjs';
import { generateArticleCategoriesSitemap } from './sitemap/article-categories.mjs';
import { generateArticlePagesSitemap } from './sitemap/articles.mjs';


if (process.env.NODE_ENV !== 'production') {
  process.exit(0);
}

const files = [];

generateStaticSitemap();
files.push('static-sitemap.xml');

files.push(...await generateRecipeSitemaps());
files.push(...await generateDishesSitemap());
files.push(...await generateRecipesListSitemap());
files.push(...await generateArticleTypesSitemap());
files.push(...await generateArticleCategoriesSitemap());
files.push(...await generateArticlePagesSitemap());

generateIndexSitemap(files);

console.log('✅ All sitemaps generated');
