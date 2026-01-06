import { Component, inject, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AsyncPipe } from '@angular/common';
import { Meta, Title } from '@angular/platform-browser';

import { SsrLinkDirective } from '../../../shared/SsrLinkDirective/ssr-link.directive';
import { AuthService } from '../../../core/services/auth/auth-service';
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
  standalone: true,
  imports: [RouterModule, SsrLinkDirective, AsyncPipe],
  templateUrl: './profile.html',
  styleUrl: './profile.scss',
})
export class Profile implements OnInit {
  private readonly auth = inject(AuthService);
  private readonly favoritesService = inject(FavoritesService);
  private readonly recipeService = inject(RecipeService);
  private readonly meta = inject(Meta);
  private readonly title = inject(Title);

  readonly list = LIST;
  activeItem = 0;
  isMenuOpen = false;

  user$ = this.auth.user$;

  recipes$: Observable<ShortRecipesResponse[]> = this.user$.pipe(
    switchMap(user => {
      if (!user) return of([]);
      return this.favoritesService.getFavorites(user.uid).pipe(
        switchMap(ids =>
          ids.length ? this.recipeService.getRecipesByIds(ids) : of([])
        )
      );
    })
  );

  ngOnInit(): void {
    // 🔴 КЛЮЧОВЕ: профіль — приватна сторінка
    this.meta.updateTag({
      name: 'robots',
      content: 'noindex, nofollow',
    });

    // Title тільки для UX
    this.title.setTitle('Профіль | Синій Кіт');
  }

  onSelectItem(i: number): void {
    this.activeItem = i;
  }

  openMobileMenu(): void {
    this.isMenuOpen = !this.isMenuOpen;
  }

  async logout(): Promise<void> {
    await this.auth.logout();
  }
}
