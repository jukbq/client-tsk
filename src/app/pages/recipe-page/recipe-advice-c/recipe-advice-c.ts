import { DOCUMENT } from '@angular/common';
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
  private document = inject(DOCUMENT);
  private readonly allowedTags = new Set(['p', 'ul', 'ol', 'li', 'strong', 'em', 'br', 'a']);

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
    this.faq().map((item) => ({
      question: item?.question || '',
      answer: this.sanitize(item?.answer || ''),
    })),
  );

  private sanitize(html: string): SafeHtml {
    const sanitized = this.cleanRecipeHtml(html || '');
    return this.sanitizer.bypassSecurityTrustHtml(sanitized);
  }

  private cleanRecipeHtml(html: string): string {
    if (!html) return '';

    const container = this.document.createElement('div');
    container.innerHTML = html;

    const result = this.document.createElement('div');
    for (const node of Array.from(container.childNodes)) {
      const cleaned = this.cleanNode(node);
      if (cleaned) {
        result.appendChild(cleaned);
      }
    }

    return result.innerHTML;
  }

  private cleanNode(node: Node): Node | null {
    if (node.nodeType === Node.TEXT_NODE) {
      return this.document.createTextNode(node.textContent || '');
    }

    if (node.nodeType !== Node.ELEMENT_NODE) {
      return null;
    }

    const element = node as HTMLElement;
    const tag = element.tagName.toLowerCase();

    if (tag === 'script' || tag === 'style') {
      return null;
    }

    if (tag === 'span' || !this.allowedTags.has(tag)) {
      const fragment = this.document.createDocumentFragment();
      for (const child of Array.from(element.childNodes)) {
        const cleanedChild = this.cleanNode(child);
        if (cleanedChild) {
          fragment.appendChild(cleanedChild);
        }
      }
      return fragment;
    }

    const cleanElement = this.document.createElement(tag);

    if (tag === 'a') {
      const href = this.normalizeHref(element.getAttribute('href'));
      if (href) {
        cleanElement.setAttribute('href', href);
      }
      cleanElement.setAttribute('target', '_blank');
      cleanElement.setAttribute('rel', 'noopener');
    }

    for (const child of Array.from(element.childNodes)) {
      const cleanedChild = this.cleanNode(child);
      if (cleanedChild) {
        cleanElement.appendChild(cleanedChild);
      }
    }

    return cleanElement;
  }

  private normalizeHref(href: string | null): string | null {
    if (!href) return null;
    const value = href.trim();
    if (!value) return null;

    const lower = value.toLowerCase();
    const isSafeProtocol =
      lower.startsWith('http://') ||
      lower.startsWith('https://') ||
      lower.startsWith('mailto:') ||
      lower.startsWith('tel:') ||
      lower.startsWith('/') ||
      lower.startsWith('#');

    return isSafeProtocol ? value : null;
  }

  toggleExpand(): void {
    this.isExpanded.update((v) => !v);
  }
}
