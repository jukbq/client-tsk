import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, Inject, Input, PLATFORM_ID, SimpleChanges } from '@angular/core';

@Component({
  selector: 'app-recipe-instructions',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './recipe-instructions.component.html',
  styleUrl: './recipe-instructions.component.scss',
})
export class RecipeInstructionsComponent {
  @Input() instructions: any = [];

  // ключі виду "i-j" => boolean
  accordionState: { [key: string]: boolean } = {};

  // бажана кількість відкритих акордеонів при старті
  private initialOpenCount = 2;

  isBrowser = false;
  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  toggleAccordion(i: number, j: number): void {
    const key = `${i}-${j}`;
    this.accordionState[key] = !this.accordionState[key];
  }

  isAccordionOpen(i: number, j: number): boolean {
    return !!this.accordionState[`${i}-${j}`];
  }

  // 🧩 Безпечний метод, який не впаде на сервері
  getScrollHeight(i: number, j: number): string {
    if (!this.isBrowser) return '0px'; // 🚫 не на клієнті – нічого не робимо
    const el = document.querySelector(
      `.accordion-content[data-key='${i}-${j}']`
    ) as HTMLElement;
    return el ? `${el.scrollHeight}px` : '0px';
  }

  // 🪄 Ініціалізація відкритих акордеонів
  ngOnChanges(): void {
    this.accordionState = {};
    let opened = 0;
    for (let i = 0; i < (this.instructions?.length || 0); i++) {
      const stepBlock = this.instructions[i];
      if (!stepBlock?.group) continue;
      for (let j = 0; j < stepBlock.group.length; j++) {
        const key = `${i}-${j}`;
        if (
          stepBlock.group[j]?.fullDescription &&
          opened < this.initialOpenCount
        ) {
          this.accordionState[key] = true;
          opened++;
        } else {
          this.accordionState[key] = false;
        }
      }
    }
  }
}
