import { ApplicationConfig, provideExperimentalZonelessChangeDetection } from '@angular/core';
import { provideRouter, withHashLocation } from '@angular/router';

import { ROUTES } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [provideExperimentalZonelessChangeDetection(), provideRouter(ROUTES, withHashLocation())]
};
