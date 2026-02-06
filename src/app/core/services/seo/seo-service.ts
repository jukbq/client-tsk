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
      const name =
        item.selectedProduct?.productsName?.trim() || 'Інгредієнт';

      const amount = Number(item.amount);
      const unitRaw = item.unitsMeasure?.trim();
      const notes = item.notes?.trim();

      // 1️⃣ За смаком / без кількості
      if (
        !amount ||
        amount === 0 ||
        unitRaw?.toLowerCase().includes('на смак')
      ) {
        result.push(`${name} — За смаком `);
        return;
      }

      // 2️⃣ Нормалізуємо одиниці
      const unit = this.normalizeUnit(unitRaw);

      // 3️⃣ Основний формат
      let ingredient = `${name} — ${amount} ${unit}`;

      // 4️⃣ Примітки (опційно)
      if (notes) {
        ingredient += ` (${notes})`;
      }

      result.push(ingredient);
    });
  });

  return result;
}

// Нормалізація одиниць для schema.org
private normalizeUnit(unit: string): string {
  const map: Record<string, string> = {
    'г.': 'г',
    'гр.': 'г',
    'мл.': 'мл',
    'л.': 'л',
    'шт.': 'шт'
  };

  return map[unit] || unit;
}



// Конвертер кроків для schema (чистий, без глюків)
convertStepsToSchema(steps: any[], currentURL: string): any[] {
  const schemaSteps: any[] = [];
  let globalStepIndex = 1;

  const cleanTextForSchema = (html: string): string => {
    return html
      // прибираємо HTML
      .replace(/<[^>]*>/g, '')
      // HTML entities → нормальний текст
      .replace(/&nbsp;/g, ' ')
      .replace(/&mdash;/g, '—')
      .replace(/&ndash;/g, '–')
      .replace(/&times;/g, '×')
      // зайві пробіли
      .replace(/\s+/g, ' ')
      .trim();
  };

  const origin =
    this.document?.location?.origin || 'https://tsk.in.ua';

  for (const group of steps) {
    for (const step of group.group) {
      if (!step.description?.trim()) continue;

      const text = cleanTextForSchema(step.description);
      if (!text) continue;

      const stepData: any = {
        "@type": "HowToStep",
        text,
        url: `${origin}${currentURL}#Step${globalStepIndex}`,
      };

      // name — тільки якщо є нормальний
      if (step.stepName?.trim()) {
        stepData.name = step.stepName.trim();
      }

      // image — масив, не рядок
      if (step.stepImage?.trim()) {
        stepData.image = [step.stepImage.trim()];
      }

      schemaSteps.push(stepData);
      globalStepIndex++;
    }
  }

  return schemaSteps;
}



setHreflang(url: string) {
  if (!url) return;

  const href = url.startsWith('http')
    ? url
    : `${this.document.location.origin}${url}`;

  const hreflangs = ['uk', 'x-default'];

  hreflangs.forEach(lang => {
    let link = this.document.querySelector(
      `link[rel="alternate"][hreflang="${lang}"]`
    ) as HTMLLinkElement | null;

    if (!link) {
      link = this.renderer.createElement('link');
      this.renderer.setAttribute(link, 'rel', 'alternate');
      this.renderer.setAttribute(link, 'hreflang', lang);
      this.renderer.appendChild(this.document.head, link);
    }

    this.renderer.setAttribute(link, 'href', href);
  });
}

}
