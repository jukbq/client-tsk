import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, ResolveFn, Router, RouterStateSnapshot } from '@angular/router';
import { catchError, map, Observable, of, take } from 'rxjs';
import { DishesService } from '../../../core/services/dishes/dishes-service';

export interface DishByIdResolveData {
  data: any;
  url: string;
  meta: {
    title: string;
    description: string;
    image: string;
    url: string;
  } | null;
  schemas: any[];
  faq: any[]; //
}

export const dishByIdResolver: ResolveFn<DishByIdResolveData | null> = (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot,
): Observable<DishByIdResolveData | null> => {
  const dishesID = route.params['dishesid'];
  const currentURL = `https://tsk.in.ua${state.url}`;

  const dishesService = inject(DishesService);
  const router = inject(Router);

  return dishesService.getObjectById(dishesID).pipe(
    take(1),

    map((data) => {
     
      
      if (!data) {
        router.navigate(['/404']);
        return null;
      }

      // 🔥 META
      const meta = {
        title: data.seoName,
        description: data.seoDescription,
        image: data.image,
      
        url: currentURL,
      };

      // 🔥 SCHEMA
      const collectionSchema = {
        '@context': 'https://schema.org',
        '@type': 'CollectionPage',
        name: data.dishesName,
        description: data.seoDescription,
        image: data.image,
        url: currentURL,
      };

      const breadcrumbSchema = {
         '@context': 'https://schema.org',
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
            name: data.dishesName,
            item: currentURL,
          },
        ],
      };

      const faq = data.faq || [];

      const faqSchema = faq.length
        ? {
           '@context': 'https://schema.org',
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

      return {
        data,
        url: currentURL,
        meta,
        faq, // 🔥 ОЦЕ ДОДАЄМО
        schemas: [...(faqSchema ? [faqSchema] : []), collectionSchema, breadcrumbSchema],
      };
    }),

    catchError(() => {
      router.navigate(['/404']);
      return of(null);
    }),
  );
};
