import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
 // 🍲 Категорії страв (динамічні)
  {
    path: 'categories/:dishesid',
    renderMode: RenderMode.Server,
  },
  // 📝 Сторінка самого рецепту (динамічна)
  {
    path: 'recipe-page/:recipeid',
    renderMode: RenderMode.Server,
  },
  // 🔍 Фільтри та слаги
  {
    path: 'recipe-filte/:filterType/:slug',
    renderMode: RenderMode.Server,
  },
  // 📁 Категорії статей
  {
    path: 'article-categories/:articleTypeId',
    renderMode: RenderMode.Server,
  },
  // 📰 Сторінка статті
  {
    path: 'article-page/:articleId',
    renderMode: RenderMode.Server,
  },
  // 🌐 Всі інші статичні сторінки (головна, контакти тощо) 
  // Теж ставимо в режим Server, щоб уникнути будь-яких конфліктів при білді
  {
    path: '**',
    renderMode: RenderMode.Server,
  },
];
