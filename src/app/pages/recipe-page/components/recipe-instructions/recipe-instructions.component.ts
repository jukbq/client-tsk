import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-recipe-instructions',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './recipe-instructions.component.html',
  styleUrl: './recipe-instructions.component.scss'
})
export class RecipeInstructionsComponent {
  @Input() instructions: any = [];

  accordionState: { [key: string]: boolean } = {};

  toggleAccordion(i: number, j: number): void {
    const key = `${i}-${j}`;
    this.accordionState[key] = !this.accordionState[key];
  }

  isAccordionOpen(i: number, j: number): boolean {
    return !!this.accordionState[`${i}-${j}`];
  }

  getScrollHeight(i: number, j: number): string {
    const el = document.querySelector(
      `.accordion-content[data-key='${i}-${j}']`
    ) as HTMLElement;
    return el ? `${el.scrollHeight}px` : 'auto';
  }

}
