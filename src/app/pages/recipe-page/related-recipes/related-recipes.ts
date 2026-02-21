import { Component, input } from '@angular/core';
import { SsrLinkDirective } from '../../../shared/SsrLinkDirective/ssr-link.directive';
import { NgOptimizedImage } from '@angular/common';

@Component({
  selector: 'app-related-recipes',
  imports: [SsrLinkDirective, NgOptimizedImage],
  templateUrl: './related-recipes.html',
  styleUrl: './related-recipes.scss',
})
export class RelatedRecipes {
 recipes = input<any[]>([]);
}
