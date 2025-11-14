import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Firestore, doc, getDoc } from '@angular/fire/firestore';
import { switchMap } from 'rxjs/operators';
import { from, Observable, of } from 'rxjs';
import { AuthService } from '../../services/auth/auth.service';
import { User } from '@angular/fire/auth';
import { FavoritesService } from '../../services/favorites/favorites.service';
import { RecipeService } from '../../services/recipe/recipe.service';
import { ShortRecipesResponse } from '../../interfaces/short-recipes';
import { SsrLinkDirective } from '../../directives/ssr-link.directive';


interface MenuItem {
  id: string;
  name: string;
  subItems?: MenuItem[];
}

const LIST: MenuItem[] = [
  { id: 'user-data', name: 'Моя комора' },
  { id: 'favorites', name: 'Смаколики до душі' },
/*   { id: 'drafts', name: 'Недоварені записи' },
  { id: 'settings', name: 'Скриня налаштувань' }, */
];

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, RouterModule, SsrLinkDirective],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss',
})
export class ProfileComponent {
  list: MenuItem[] = LIST;
  activeItem: number | undefined = 0;

  isMenuOpen = false;

  user$: Observable<User | null>;
  userDoc$: any;

  favorites: string[] = [];
  recipes: ShortRecipesResponse[] = [];

  constructor(
    private auth: AuthService,
    private firestore: Firestore,
    private favoritesService: FavoritesService,
    private recipeService: RecipeService
  ) {
    this.user$ = this.auth.user$;

    this.userDoc$ = this.auth.user$.pipe(
      switchMap((u) => {
        if (!u) return of(null);
        const ref = doc(this.firestore, `users/${u.uid}`);
        return from(getDoc(ref)).pipe(
          switchMap((snap) => of(snap.exists() ? snap.data() : null))
        );
      })
    );

    this.auth.user$.subscribe((u) => {
      if (u) {
        // Підписка на оновлення favorites
        this.favoritesService.getFavorites(u.uid).subscribe((favs) => {
          this.favorites = favs;

          // Отримуємо дані рецептів по id
          this.recipeService.getRecipesByIds(favs).subscribe((recipes) => {
            this.recipes = recipes;
                   });
        });
      }
    });
  }

  onSelectItem(i: number): void {
    // Якщо клікнули на активний пункт — закриваємо, інакше відкриваємо його
    this.activeItem = this.activeItem === i ? undefined : i;
  }
  async logout() {
    await this.auth.logout();
  }

  openMobileMenu(): void {
    this.isMenuOpen = !this.isMenuOpen;

  
  }
}
