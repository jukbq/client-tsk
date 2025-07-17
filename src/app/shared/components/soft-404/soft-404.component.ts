import { Response } from 'express';
import { CommonModule, isPlatformServer } from '@angular/common';
import { ChangeDetectionStrategy, Component, Inject, inject, Optional, PLATFORM_ID } from '@angular/core';
import { RESPONSE } from '../../../../express.tokens';
import { Meta, Title } from '@angular/platform-browser';




@Component({
  selector: 'app-soft-404',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './soft-404.component.html',
  styleUrl: './soft-404.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class Soft404Component {
  platformId = inject(PLATFORM_ID);

  constructor(
    @Optional() @Inject(RESPONSE) private response: Response,
    private titleService: Title,
    private metaService: Meta
  ) {
    if (isPlatformServer(this.platformId)) {
      this.response?.status(404);
      this.titleService.setTitle('Сторінку не знайдено – Синій Кіт');
      this.metaService.updateTag({ name: 'robots', content: 'noindex, nofollow' });
    }
  }
}
