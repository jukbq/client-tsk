import { isPlatformBrowser, isPlatformServer } from '@angular/common';
import { DOCUMENT, Inject, Injectable, PLATFORM_ID, Renderer2, RendererFactory2 } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';

@Injectable({
  providedIn: 'root',
})
export class SeoService {
  private renderer: Renderer2;

  constructor(
    @Inject(DOCUMENT) private document: Document,
    @Inject(PLATFORM_ID) private platformId: Object,
    private meta: Meta,
    private titleService: Title,
    rendererFactory: RendererFactory2
  ) {
    this.renderer = rendererFactory.createRenderer(null, null);
  }

  // Встановлюємо title сторінки
  setTitle(title: string) {
    this.titleService.setTitle(title);
  }

  // Оновлюємо meta tag
  setMeta(name: string, content: string) {
    this.meta.updateTag({ name, content });
  }

  // Встановлюємо canonical URL
  setCanonicalUrl(url: string) {
    if (!url) return;
    const canonicalUrl = url.startsWith('http') ? url : `${this.document.location.origin}${url}`;

    let link = this.document.querySelector("link[rel='canonical']") as HTMLLinkElement | null;

    if (!link) {
      link = this.renderer.createElement('link');
      this.renderer.setAttribute(link, 'rel', 'canonical');
      this.renderer.appendChild(this.document.head, link);
    }

    if (link) {
      this.renderer.setAttribute(link, 'href', canonicalUrl);
    }
  }

  // Вставка JSON-LD schema
  setSchema(schema: any) {
    let script = this.document.querySelector("script[type='application/ld+json']") as HTMLScriptElement | null;

    if (!script) {
      script = this.renderer.createElement('script');
      this.renderer.setAttribute(script, 'type', 'application/ld+json');
      this.renderer.appendChild(this.document.head, script);
    }

    const json = JSON.stringify(schema, null, 2);

    if (script) {
      if (isPlatformBrowser(this.platformId)) {
        script.text = json;
      } else if (isPlatformServer(this.platformId)) {
        script.textContent = json;
      }
    }
  }

  // Конвертер часу для schema (ISO 8601)
  convertTimeToISO(time: string | null | undefined): string {
    if (!time || !time.includes(':')) return 'PT0M';
    const [h, m] = time.split(':').map(x => parseInt(x, 10));
    return `PT${h}H${m}M`;
  }

  // Форматування інгредієнтів для schema
  formatIngredientsForSchema(groups: any[]): string[] {
    const result: string[] = [];
    groups.forEach(g => {
      g.group.forEach((item: any) => {
        const amount = item.amount ? `${item.amount} ` : '';
        const unit = item.unitsMeasure ? `${item.unitsMeasure} ` : '';
        const notes = item.notes ? `(${item.notes}) ` : '';
        const name = item.selectedProduct?.productsName?.trim() || 'Інгредієнт';
        result.push(`${amount}${unit}${name} ${notes}`.trim());
      });
    });
    return result;
  }

  // Конвертер кроків для schema
  convertStepsToSchema(steps: any[], currentURL: string): any[] {
    const schemaSteps: any[] = [];
    function stripHtml(html: string): string {
      return html.replace(/<\/?[^>]+(>|$)/g, '');
    }
    let globalStepIndex = 1;

    for (const group of steps) {
      for (const step of group.group) {
        if (!step.description?.trim()) continue;
        const stepData: any = {
          "@type": "HowToStep",
          "name": step.stepName || "",
          "text": stripHtml(step.description),
          "url": `${this.document.location.origin}${currentURL}#Step${globalStepIndex}`,
          ...(step.stepImage?.trim() ? { image: step.stepImage } : {})
        };
        schemaSteps.push(stepData);
        globalStepIndex++;
      }
    }
    return schemaSteps;
  }
}
