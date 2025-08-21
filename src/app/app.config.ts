import { ApplicationConfig, InjectionToken, provideExperimentalZonelessChangeDetection, Provider } from '@angular/core';
import { provideRouter, withHashLocation } from '@angular/router';
import { ROUTES } from './app.routes';
import { environment } from './environments/environment.web';


// export const BROWSER: InjectionToken<typeof browser> = new InjectionToken<typeof browser>('Browser extension browser', {
//   factory: () => browser,
// });

export const BROWSER: InjectionToken<typeof browser> = new InjectionToken<typeof browser>('Browser extension browser');

const browserProvider: Provider = {
  provide: BROWSER,
  useValue: environment.mode === 'web' ? null : browser,
}

export const appConfig: ApplicationConfig = {
  providers: [provideExperimentalZonelessChangeDetection(), provideRouter(ROUTES, withHashLocation()), browserProvider]
};
