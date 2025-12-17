import { Component, input, Input, signal } from '@angular/core';
import { SsrLinkDirective } from '../../../shared/SsrLinkDirective/ssr-link.directive';
import { NgOptimizedImage } from '@angular/common';

@Component({
  selector: 'app-ingredients',
  imports: [SsrLinkDirective, NgOptimizedImage],
  templateUrl: './ingredients.html',
  styleUrl: './ingredients.scss',
})
export class Ingredients {
 // Використовуємо сигнали для вхідних даних
  ingredients = input<any[]>([]);
  accompanyingRecipes = input<any[]>([]);

  // Локальний стан
  isExpanded = signal(false);

  toggleExpand() {
    this.isExpanded.update(v => !v);
  }

  saveToViber() {
    const list = this.generateIngredientList();
    const viberUrl = `viber://forward?text=${encodeURIComponent(list)}`;
    window.open(viberUrl, '_blank');
  }

  saveToTelegram() {
    const list = this.generateIngredientList();
    const telegramUrl = `https://t.me/share/url?url=${encodeURIComponent(list)}`;
    window.open(telegramUrl, '_blank');
  }

  private generateIngredientList(): string {
    let listText = "🛒 Список інгредієнтів:\n\n";
    
    this.ingredients().forEach((item: any) => {
      if (item.name) {
        listText += `🔹 ${item.name.toUpperCase()}:\n`;
      }
      item.group.forEach((ing: any) => {
        listText += `• ${ing.text}\n`;
      });
      listText += '\n';
    });

    listText += "Смачного від Синього Кота! 🐱💙";
    return listText;
  }
}
