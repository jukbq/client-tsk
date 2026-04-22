import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, ResolveFn, RouterStateSnapshot } from '@angular/router';
import { map, Observable, take } from 'rxjs';
import { CategoriesService } from '../../../core/services/categories/categories-service';

// Тип, який резолвер повертає
export interface CategoryByIdResolveData {
  data: any;
  url: string;
}

export const categoryByIdResolver: ResolveFn<CategoryByIdResolveData> = (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot,
): Observable<CategoryByIdResolveData> => {
  const categoryid = route.params['categoryid'];
  const currentURL = state.url;
  const categoryService = inject(CategoriesService);

  return categoryService.getObjectById(categoryid).pipe(
    take(1),
    map((data) => {
      console.log(data);
      
      if (!data) {
        return {
          data: null,
          url: `https://tsk.in.ua${currentURL}`,
          meta: null,
          schemas: [],
        };
      }

      const url = `https://tsk.in.ua${currentURL}`;

      const meta = {
        title: data.seoCategoryName,
        description: data.seoCategoryDescription,
        image: data.image,
        verticalImage: data.verticalImage,
        url,
      };

      const faq = data.faq || [];

      const faqSchema = faq.length
        ? {
            '@type': 'FAQPage',
            mainEntity: faq.map((item: any) => ({
              '@type': 'Question',
              name: item.question,
              acceptedAnswer: {
                '@type': 'Answer',
                text: item.answer,
              },
            })),
          }
        : null;

      const breadcrumbSchema = {
        '@type': 'BreadcrumbList',
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name: 'Головна',
            item: 'https://tsk.in.ua/',
          },
          {
            '@type': 'ListItem',
            position: 2,
            name: 'Рецепти Синього Кота',
            item: 'https://tsk.in.ua/dishes',
          },
          {
            '@type': 'ListItem',
            position: 3,
            name: data.dishes?.dishesName,
            item: `https://tsk.in.ua/categories/${data.dishes?.id}`,
          },
          {
            '@type': 'ListItem',
            position: 4,
            name: data.categoryName,
            item: url,
          },
        ],
      };

      const schemas = [...(faqSchema ? [faqSchema] : []), breadcrumbSchema];

      return {
        data,
        url,
        meta,
        schemas,
      };
    }),
  );
};
