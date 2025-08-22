export enum PriceSign {
  More = 'more',
  Less = 'less',
}

export const enum OptionsKeys {
  FILTER_BY_COUNTERPARTY = 'filterByCounterparty',
  FILTER_BY_PRICE = 'filterByPrice',
  FILTER_BY_AMOUNT = 'filterByAmount',
}

export interface Options {
  [OptionsKeys.FILTER_BY_COUNTERPARTY]: boolean;
  [OptionsKeys.FILTER_BY_PRICE]: boolean;
  [OptionsKeys.FILTER_BY_AMOUNT]: boolean;
}

export const enum FiltersKeys {
  FAVORITE_COUNTERPARTY = 'favoriteCounterparty',
  EXCLUDE_COUNTERPARTY = 'excludeCounterparty',
  PRICE = 'price',
  PRICE_SIGN = 'priceSign',
  AMOUNT_MIN = 'amountMin',
  AMOUNT_MAX = 'amountMax',
}

export interface Filters {
  [FiltersKeys.FAVORITE_COUNTERPARTY]: string[];
  [FiltersKeys.EXCLUDE_COUNTERPARTY]: string[];
  [FiltersKeys.PRICE]: number;
  [FiltersKeys.PRICE_SIGN]: PriceSign;
  [FiltersKeys.AMOUNT_MIN]: number;
  [FiltersKeys.AMOUNT_MAX]: number;
}

export interface ExtensionStorage extends Options, Filters {};


