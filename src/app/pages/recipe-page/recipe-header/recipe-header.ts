import { Component, inject, input, Input, signal } from '@angular/core';
import { ModalService } from '../../../core/services/modal/modal.service';
import { AuthService } from '../../../core/services/auth/auth-service';
import { Router } from '@angular/router';
import { FavoritesService } from '../../../core/services/favorites/favorites-service';
import { NgOptimizedImage } from '@angular/common';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-recipe-header',
  imports: [NgOptimizedImage],
  templateUrl: './recipe-header.html',
  styleUrl: './recipe-header.scss',
})
export class RecipeHeader {
// Залежності
  private modal = inject(ModalService);
  private auth = inject(AuthService);
  private router = inject(Router);
  private fav = inject(FavoritesService);

  // Вхідні дані як сигнали
  recipeTitle = input.required<string>();
  mainImage = input.required<string>();
  recipeID = input.required<string>();

  // Стан списку обраного
  favoriteIds = signal<string[]>([]);
  private favSubscription?: Subscription;

  ngOnInit() {
    // Підписуємось на зміни в сервісі обраного, щоб синхронізувати зірочку
    const user = this.auth.currentUser;
    if (user) {
      this.favSubscription = this.fav.getFavorites(user.uid).subscribe(ids => {
        this.favoriteIds.set(ids || []);
      });
    }
  }

  ngOnDestroy() {
    this.favSubscription?.unsubscribe();
  }

  // Перевірка статусу (тепер працює через сигнал)
  isFavorite(id: string): boolean {
    return this.favoriteIds().includes(id);
  }

  toggleFavorite(id: string) {
    const user = this.auth.currentUser;
    if (!user) {
      this.modal.open({
        type: 'auth',
        data: { reason: 'add-fav', recipeId: id, returnUrl: this.router.url },
      });
      return;
    }

    if (this.isFavorite(id)) {
      this.fav.removeFavorite(user.uid, id);
    } else {
      this.fav.addFavorite(user.uid, id);
    }
  }
}
