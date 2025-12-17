import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, ResolveFn, Router, RouterStateSnapshot } from '@angular/router';
import { FilterSearch } from '../../../core/services/filter-search/filter-search';
import { getSeasonSeoDescription } from '../../../core/utils/getSeasonSeoDescription';
import { getDifficultySeoDescription } from '../../../core/utils/getDifficultySeoDescription';
/**
 * Типізація результату резолвера для кращого досвіду розробки
 */
export interface FilterResolveData {
  recipes: any[];
  currentURL: string;
  description?: any; // Мета-дані (Season, Country, Holiday тощо)
}
export const filterResolver: ResolveFn<FilterResolveData | null> = async (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot,
) => {
  const filterService = inject(FilterSearch);
  const router = inject(Router);

  const filterType = route.paramMap.get('filterType');
  const slug = route.paramMap.get('slug');
  const currentURL = state.url;


  if (!filterType || !slug) {
    router.navigate(['/404']);
    return null;
  }

  try {
    switch (filterType) {
      case 'season': {
        const descriptionSeason = getSeasonSeoDescription(slug);
        if (!descriptionSeason) throw new Error('Not Found');
        
        const recipes = await filterService.getRecipesByFilter({ sesonList: slug });
        if (!recipes.length) throw new Error('No recipes');
              
        return { recipes, currentURL, descriptionSeason };
      }

      case 'difficultyPreparation': {
        const descriptionDifficulty = getDifficultySeoDescription(slug);
        if (!descriptionDifficulty) throw new Error('Not Found');

        const recipes = await filterService.getRecipesByTagFilter({ tagObject: 'difficultyPreparation', id: slug });
        if (!recipes.length) throw new Error('No recipes');

        return { recipes, currentURL, descriptionDifficulty };
      }

      // Об'єднана логіка для типів, що потребують запиту в БД за описом
      case 'cuisine':
      case 'region':
      case 'holiday':
      case 'recipeType': {
        const [description, recipes] = await Promise.all([
          getMetadataByFilterType(filterService, filterType, slug),
          filterService.getRecipesByTagFilter({ tagObject: filterType as any, id: slug })
        ]);

        if (!description || !recipes?.length) {
          throw new Error('Data not found');
        }

        // Повертаємо об'єкт, динамічно називаючи поле опису для сумісності з вашим старим кодом
        // Хоча краще використовувати уніфіковане ім'я "description"
        const resultKey = `description${filterType.charAt(0).toUpperCase() + filterType.slice(1)}`;
        return { 
          recipes, 
          currentURL, 
          [resultKey]: description 
        } as any;
      }

      default:
        router.navigate(['/404']);
        return null;
    }
  } catch (error) {
    console.error('Resolver error:', error);
    router.navigate(['/404']);
    return null;
  }
};

/**
 * Хелпер для виклику правильного методу сервісу
 */
async function getMetadataByFilterType(service: FilterSearch, type: string, slug: string) {
  switch (type) {
    case 'cuisine': return service.getCountryTagFilter(slug);
    case 'region': return service.getRegionTagFilter(slug);
    case 'holiday': return service.getHolidayTagFilter(slug);
    case 'recipeType': return service.getrecipeTypeTagFilter(slug);
    default: return null;
  }
}