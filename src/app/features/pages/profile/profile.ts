import { Component, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { SsrLinkDirective } from '../../../shared/SsrLinkDirective/ssr-link.directive';
import { AsyncPipe } from '@angular/common';
import { AuthService } from '../../../core/services/auth/auth-service';
import { Firestore } from '@angular/fire/firestore';
import { FavoritesService } from '../../../core/services/favorites/favorites-service';
import { RecipeService } from '../../../core/services/recipe/recipe-service';
import { Observable, of, switchMap } from 'rxjs';
import { ShortRecipesResponse } from '../../../core/interfaces/short-recipes';

interface MenuItem {
  id: string;
  name: string;
}

const LIST: MenuItem[] = [
  { id: 'user-data', name: 'Моя комора' },
  { id: 'favorites', name: 'Смаколики до душі' },
  { id: 'drafts', name: 'Недоварені записи' },
  { id: 'settings', name: 'Скриня налаштувань' },
];

@Component({
  selector: 'app-profile',
  imports: [RouterModule, SsrLinkDirective, AsyncPipe],
  templateUrl: './profile.html',
  styleUrl: './profile.scss',
})
export class Profile {
private auth = inject(AuthService);
  private firestore = inject(Firestore);
  private favoritesService = inject(FavoritesService);
  private recipeService = inject(RecipeService);

  readonly list = LIST;
  activeItem = 0;
  isMenuOpen = false;

  user$ = this.auth.user$;


  

  // Отримуємо рецепти через потік, уникаючи вкладених subscribe
  recipes$: Observable<ShortRecipesResponse[]> = this.user$.pipe(
    switchMap(user => {
      if (!user) return of([]);
      return this.favoritesService.getFavorites(user.uid).pipe(
        switchMap(ids => ids.length > 0 ? this.recipeService.getRecipesByIds(ids) : of([]))
      );
    })
  );

  onSelectItem(i: number): void {
    this.activeItem = i;
  }

  openMobileMenu(): void {
    this.isMenuOpen = !this.isMenuOpen;
  }

  async logout() {
    await this.auth.logout();
  }
}
