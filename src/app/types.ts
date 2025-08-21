import { InjectionToken } from "@angular/core";

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
  filterByAmount: boolean;
}

export interface Filters {
  favoriteCounterparty: string[];
  excludeCounterparty: string[];
  price: number;
  priceSign: PriceSign;
  amountMin: number;
  amountMax: number;
}

export interface ExtensionStorage extends Options, Filters {};


