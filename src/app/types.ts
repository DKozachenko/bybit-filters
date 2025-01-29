import { InjectionToken } from "@angular/core";

export enum NotInFilterElemAction {
  Darken = 'darken',
  Remove = 'remove'
}

export enum PriceSign {
  More = 'more',
  Less = 'less',
}

export const BROWSER: InjectionToken<typeof browser> = new InjectionToken<typeof browser>('Browser extension browser', {
  factory: () => browser,
});

export interface Options {
  filterByCounterparty: boolean;
  filterByPrice: boolean;
  filterByBottomLimit: boolean;
  filterByTopLimit: boolean;
  notInFilterElemAction: NotInFilterElemAction;
}

export interface Filters {
  excludeCounterparty: string[];
  price: number;
  priceSign: PriceSign;
  topLimit: number;
  bottomLimit: number;
}

export interface ExtensionStorage extends Options, Filters {};


