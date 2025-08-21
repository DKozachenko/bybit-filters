export enum PriceSign {
  More = 'more',
  Less = 'less',
}

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


