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

async shareIngredients() {
    const list = this.generateIngredientList();
    
    try {
      if (navigator.share) {
        await navigator.share({
          title: 'Список інгредієнтів',
          text: list
        });
      } else {
        // Fallback: копіювання у буфер обміну
        await navigator.clipboard.writeText(list);
        alert('Список інгредієнтів скопійовано у буфер обміну');
      }
    } catch (error) {
      // Обробка помилки при закритті вікна поділитися
      console.log('Користувач скасував поділитися або виникла помилка:', error);
    }
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
