import { ActivatedRouteSnapshot, ResolveFn, RouterStateSnapshot } from '@angular/router';
import { from, map, Observable, of, throwError, switchMap } from 'rxjs';
import { FilterServiceService } from '../../services/filerService/filter-service.service';
import { inject } from '@angular/core';
import { getSeasonSeoDescription } from '../../utils/getSeasonSeoDescription';
import { getDifficultySeoDescription } from '../../utils/getDifficultySeoDescription';

export const filterResolver: ResolveFn<any> = (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot
): Observable<any> => {
  const filterService = inject(FilterServiceService);
  const filterType = route.paramMap.get('filterType');
  const slug = route.paramMap.get('slug');
  const currentURL = state.url;


  if (!filterType || !slug) {
    return throwError(() => new Error('Invalid URL'));
  }

  // Перевіряємо всі типи фільтрів:
  switch (filterType) {
    case 'season': {
      const descriptionSeason = getSeasonSeoDescription(slug);
      if (!descriptionSeason) return throwError(() => new Error('Season not found'));

      return from(filterService.getRecipesByFilter({ sesonList: slug })).pipe(
        switchMap(recipes => {
          if (!recipes?.length) return throwError(() => new Error('No recipes'));
          return of({ recipes, currentURL, descriptionSeason });
        })
      );
    }

    case 'difficultyPreparation': {
      const descriptionDifficulty = getDifficultySeoDescription(slug);
      if (!descriptionDifficulty) return throwError(() => new Error('Difficulty not found'));

      return from(filterService.getRecipesByTagFilter({ tagObject: 'difficultyPreparation', id: slug })).pipe(
        switchMap(recipes => {
          if (!recipes?.length) return throwError(() => new Error('No recipes'));
          return of({ recipes, currentURL, descriptionDifficulty });
        })
      );
    }

    case 'cuisine': {
      return from(Promise.all([
        filterService.getCountryTagFilter(slug),
        filterService.getRecipesByTagFilter({ tagObject: 'cuisine', id: slug })
      ])).pipe(
        switchMap(([descriptionCountry, recipes]) => {
          if (!descriptionCountry || !recipes?.length) return throwError(() => new Error('Cuisine not found'));
          return of({ recipes, currentURL, descriptionCountry });
        })
      );
    }

    case 'region': {
      return from(Promise.all([
        filterService.getRegionTagFilter(slug),
        filterService.getRecipesByTagFilter({ tagObject: 'region', id: slug })
      ])).pipe(
        switchMap(([descriptionRegion, recipes]) => {
          if (!descriptionRegion || !recipes?.length) return throwError(() => new Error('Region not found'));
          return of({ recipes, currentURL, descriptionRegion });
        })
      );
    }

    case 'holiday': {
      return from(Promise.all([
        filterService.getHolidayTagFilter(slug),
        filterService.getRecipesByTagFilter({ tagObject: 'holiday', id: slug })
      ])).pipe(
        switchMap(([descriptionHoliday, recipes]) => {
          if (!descriptionHoliday || !recipes?.length) return throwError(() => new Error('Holiday not found'));
          return of({ recipes, currentURL, descriptionHoliday });
        })
      );
    }

    case 'recipeType': {
      return from(Promise.all([
        filterService.getrecipeTypeTagFilter(slug),
        filterService.getRecipesByTagFilter({ tagObject: 'recipeType', id: slug })
      ])).pipe(
        switchMap(([descriptionRecipeType, recipes]) => {
          if (!descriptionRecipeType || !recipes?.length) return throwError(() => new Error('Type not found'));
          return of({ recipes, currentURL, descriptionRecipeType });
        })
      );
    }


    default:
      return throwError(() => new Error('Unknown filter type'));
  }
};
