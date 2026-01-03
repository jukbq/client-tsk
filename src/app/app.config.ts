import {
  ApplicationConfig,
  provideBrowserGlobalErrorListeners,
  provideZonelessChangeDetection,
  PLATFORM_ID,
  inject
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getAuth, provideAuth } from '@angular/fire/auth';
import { getAnalytics, provideAnalytics, ScreenTrackingService, UserTrackingService } from '@angular/fire/analytics';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';
import { getStorage, provideStorage } from '@angular/fire/storage';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),
    provideRouter(routes),
    provideClientHydration(withEventReplay()),

    // Основна ініціалізація Firebase
    provideFirebaseApp(() =>
      initializeApp({
        projectId: 'taverna-synii-kit-13c01',
        appId: '1:772248790978:web:8a51ae2b154b2b4724d85b',
        storageBucket: 'taverna-synii-kit-13c01.firebasestorage.app',
        apiKey: 'AIzaSyDgFnkCHoJeuBzVaj0HfweLvknxWmpuxXM',
        authDomain: 'taverna-synii-kit-13c01.firebaseapp.com',
        messagingSenderId: '772248790978',
        measurementId: 'G-2JFZM27XYJ',
      })
    ),

    // Оптимізований Auth: завантажується тільки в браузері
    provideAuth(() => {
      const platformId = inject(PLATFORM_ID);
      if (isPlatformBrowser(platformId)) {
        return getAuth();
      }
      return {} as any; // Повертаємо пустий об'єкт для сервера
    }),

    // Оптимізована Аналітика: не блокує старт додатка
    provideAnalytics(() => {
      const platformId = inject(PLATFORM_ID);
      if (isPlatformBrowser(platformId)) {
        return getAnalytics();
      }
      return {} as any;
    }),

   
    provideFirestore(() => getFirestore()),
    provideStorage(() => getStorage()),

     ScreenTrackingService,
    UserTrackingService,
  ],
};