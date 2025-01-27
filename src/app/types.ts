import { InjectionToken } from "@angular/core";

export enum NotInFilterElemAction {
  Darken = 'darken',
  Remove = 'remove'
}

export const BROWSER: InjectionToken<typeof browser> = new InjectionToken<typeof browser>('Browser extension browser', {
  factory: () => browser,
});

export interface Storage {
  filterByCounterparty: boolean;
  filterByPrice: boolean;
  filterByBottomLimit: boolean;
  filterByTopLimit: boolean;
  notInFilterElemAction: NotInFilterElemAction;
}

