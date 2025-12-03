import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { SsrLinkDirective } from '../../../../shared/directives/ssr-link.directive';

@Component({
  selector: 'app-recipe-ingredients',
  standalone: true,
  imports: [CommonModule, SsrLinkDirective],
  templateUrl: './recipe-ingredients.component.html',
  styleUrl: './recipe-ingredients.component.scss',
})
export class RecipeIngredientsComponent {
  @Input() ingredients: any = [];
  @Input() accompanyingRecipes: any = [];

  isExpanded = false;

  //Відбправка списку інгридієнтів в Вайбер
  saveToViber() {
    const list = this.generateIngredientList();
    const viberUrl = `viber://forward?text=${encodeURIComponent(list)}`;
    window.open(viberUrl, '_blank');
  }

  //Відбправка списку інгридієнтів в телеграм
  saveToTelegram() {
    const list = this.generateIngredientList();
    const telegramUrl = `https://t.me/share/url?url=${encodeURIComponent(
      list
    )}`;
    window.open(telegramUrl, '_blank');
  }

  //Створення списку інеридієнтів дял зебереження
  private generateIngredientList(): string {
    return this.ingredients
      .map((product: { group: any[] }) => {
        return product.group
          .map((group) => {
            return `${group.text} `;
          })
          .join('\n');
      })
      .join('\n');
  }

  toggleExpand() {
    this.isExpanded = !this.isExpanded;
  }
}
