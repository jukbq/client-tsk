import { isPlatformBrowser, NgOptimizedImage } from '@angular/common';
import { Component, inject, input, Input, PLATFORM_ID, signal, SimpleChanges } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Component({
  selector: 'app-instructions',
  imports: [NgOptimizedImage],
  templateUrl: './instructions.html',
  styleUrl: './instructions.scss',
})
export class Instructions {
// Сигнал для вхідних даних
  instructions = input<any[]>([]);

  // Стан акордеонів через сигнал-об'єкт (для реактивності)
  accordionState = signal<{ [key: string]: boolean }>({});

  private sanitizer = inject(DomSanitizer);
  private isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  private initialOpenCount = 1;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['instructions']) {
      this.initializeAccordions();
    }
  }

  private initializeAccordions() {
    const newState: { [key: string]: boolean } = {};
    let opened = 0;
    const data = this.instructions() || [];

    data.forEach((stepBlock, i) => {
      stepBlock.group?.forEach((group: any, j: number) => {
        const key = `${i}-${j}`;
        if (group.fullDescription && opened < this.initialOpenCount) {
          newState[key] = true;
          opened++;
        } else {
          newState[key] = false;
        }
      });
    });
    this.accordionState.set(newState);
  }

  toggleAccordion(i: number, j: number): void {
    const key = `${i}-${j}`;
    this.accordionState.update(state => ({
      ...state,
      [key]: !state[key]
    }));
  }

  isAccordionOpen(i: number, j: number): boolean {
    return this.accordionState()[`${i}-${j}`] || false;
  }

  sanitizeHtml(html: string): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(html);
  }

}
