import { Response } from 'express';
import { Component, Inject, Optional, PLATFORM_ID } from '@angular/core';
import { RESPONSE } from '../../../express.tokens';
import { isPlatformServer } from '@angular/common';

@Component({
  selector: 'app-soft-404',
  imports: [],
  templateUrl: './soft-404.html',
  styleUrl: './soft-404.scss',
})
export class Soft404 {
constructor(
    @Inject(PLATFORM_ID) platformId: Object,
    @Optional() @Inject(RESPONSE) private response: Response
  ) {
    // Працює ТІЛЬКИ на сервері
    if (isPlatformServer(platformId)) {
      this.response?.status(404);
    }
  }
}
