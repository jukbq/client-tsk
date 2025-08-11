import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-recipe-description',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './recipe-description.component.html',
  styleUrl: './recipe-description.component.scss'
})
export class RecipeDescriptionComponent {
  @Input() recipeSubtitles = '';
  @Input() descriptionRecipe = '';

  isExpanded = false;

  toggleExpand() {
    this.isExpanded = !this.isExpanded;
  }
}
