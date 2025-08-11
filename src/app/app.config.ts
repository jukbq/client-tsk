import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideClientHydration } from '@angular/platform-browser';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getAuth, provideAuth } from '@angular/fire/auth';
import { getAnalytics, provideAnalytics, ScreenTrackingService, UserTrackingService } from '@angular/fire/analytics';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';
import { getStorage, provideStorage } from '@angular/fire/storage';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';

export const appConfig: ApplicationConfig = {
  providers: [provideZoneChangeDetection({ eventCoalescing: true }), provideRouter(routes), provideClientHydration(), provideFirebaseApp(() => initializeApp({"projectId":"taverna-synii-kit-13c01","appId":"1:772248790978:web:8a51ae2b154b2b4724d85b","storageBucket":"taverna-synii-kit-13c01.firebasestorage.app","apiKey":"AIzaSyDgFnkCHoJeuBzVaj0HfweLvknxWmpuxXM","authDomain":"taverna-synii-kit-13c01.firebaseapp.com","messagingSenderId":"772248790978","measurementId":"G-2JFZM27XYJ"})), provideAuth(() => getAuth()), provideAnalytics(() => getAnalytics()), ScreenTrackingService, UserTrackingService, provideFirestore(() => getFirestore()), provideStorage(() => getStorage()), provideAnimationsAsync()]
};
