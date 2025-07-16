import { DOCUMENT, PlatformLocation } from '@angular/common';
import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { Meta } from '@angular/platform-browser';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class SeoService {
  constructor(
    @Inject(DOCUMENT) private document: Document,
    @Inject(PLATFORM_ID) private platformId: Object,
    private platformLocation: PlatformLocation,
    private router: Router,
    private meta: Meta) { }

  setCanonicalUrl(currentURL: string): void {
    const canonicalUrl = currentURL.startsWith('http') ? currentURL : `${this.document.location.origin}${currentURL}`;
    const linkElement = this.document.querySelector("link[rel='canonical']");

    if (linkElement) {
      // Оновлюємо існуючий тег
      linkElement.setAttribute('href', canonicalUrl);
    } else {
      // Додаємо новий тег
      const newLinkElement = this.document.createElement('link');
      newLinkElement.setAttribute('rel', 'canonical');
      newLinkElement.setAttribute('href', canonicalUrl);
      this.document.head.appendChild(newLinkElement);
    }
  }

  setSchema(recipeSchema: any) {
    const scriptTag = this.document.querySelector("script[type='application/ld+json']");

    if (scriptTag) {
      scriptTag.textContent = JSON.stringify(recipeSchema, null, 2);
    } else {
      const newScript = this.document.createElement('script');
      newScript.type = 'application/ld+json';
      newScript.text = JSON.stringify(recipeSchema, null, 2);
      this.document.head.appendChild(newScript);
    }


  }

  //Конвертор часу
  convertTimeToISO(time: string | undefined | null): string {
    if (!time || typeof time !== 'string' || !time.includes(':')) {
      return 'PT0M'; // або можеш кидати помилку, якщо це критично
    }

    const [hours, minutes] = time.split(':').map(num => parseInt(num, 10));
    if (hours === 0 && minutes === 0) return 'PT0M';
    return `PT${hours}H${minutes}M`;
  }


  //Конвертор кроків
  convertStepsToSchema(steps: any[], currentURL: any): any[] {
    const schemaSteps: any[] = [];
    const canonicalUrl = `${this.document.location.origin}${this.router.url}`;
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
          "url": `https://tsk.in.ua${currentURL}#Step${globalStepIndex}`,
          ...(step.stepImage?.trim() ? { image: step.stepImage } : {})
        };

        schemaSteps.push(stepData);
        globalStepIndex++;
      }
    }
    return schemaSteps;
  }

  //Конвертор інгридієнтів
  formatIngredientsForSchema(ingredientsGroup: any[]): string[] {
    const result: string[] = [];
    ingredientsGroup.forEach(group => {
      group.group.forEach((item: any) => {
        const amount = item.amount ? `${item.amount} ` : '';
        const unit = item.unitsMeasure ? `${item.unitsMeasure} ` : '';
        const notes = item.notes ? `(${item.notes}) ` : '';
        const name = item.selectedProduct?.productsName?.trim() || 'Інгредієнт';

        result.push(`${amount}${unit}${name} ${notes}`.trim());
      });
    });

    return result;
  }
}
