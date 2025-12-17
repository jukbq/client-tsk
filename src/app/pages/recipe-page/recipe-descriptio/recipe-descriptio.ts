import { Component, computed, inject, input, Input, signal } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'app-recipe-descriptio',
  imports: [],
  templateUrl: './recipe-descriptio.html',
  styleUrl: './recipe-descriptio.scss',
})
export class RecipeDescriptio {
 private sanitizer = inject(DomSanitizer);

  // Використовуємо modern signals для вхідних даних
  recipeSubtitles = input<string>('');
  descriptionRecipe = input<string>('');

  isExpanded = signal(false);

  // Очищення HTML через computed (оновлюється тільки коли змінюється вхідний текст)
  safeDescription = computed(() => 
    this.sanitizer.bypassSecurityTrustHtml(this.descriptionRecipe() || '')
  );

  toggleExpand() {
    this.isExpanded.update(v => !v);
  }
}
