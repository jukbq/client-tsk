import { Component, computed, inject, input, signal } from '@angular/core';
import { SsrLinkDirective } from '../../../shared/SsrLinkDirective/ssr-link.directive';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { NgOptimizedImage } from '@angular/common';

@Component({
  selector: 'app-recipe-advice-c',
  imports: [SsrLinkDirective, NgOptimizedImage],
  templateUrl: './recipe-advice-c.html',
  styleUrl: './recipe-advice-c.scss',
})
export class RecipeAdviceC {
 private sanitizer = inject(DomSanitizer);

  // Inputs як сигнали
  advice = input<string>('');
  completion = input<string>('');
  faq = input<{ question: string; answer: string }[]>([]);
  accompanyingArticles = input<any[]>([]);

  // Локальний стан розгортання
  isExpanded = signal(false);

  // Оптимізоване очищення HTML через computed
  safeAdvice = computed(() => this.sanitize(this.advice()));
  safeCompletion = computed(() => this.sanitize(this.completion()));
  safeFaq = computed(() =>
    this.faq().map(item => ({
      question: item?.question || '',
      answer: this.sanitize(item?.answer || ''),
    })),
  );

  private sanitize(html: string): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(html || '');
  }

  toggleExpand(): void {
    this.isExpanded.update(v => !v);
  }
  
}
