export enum PriceSign {
  More = 'more',
  Less = 'less',
}

export const enum OptionsKeys {
  FILTER_BY_COUNTERPARTY = 'filterByCounterparty',
  FILTER_BY_PRICE = 'filterByPrice',
  FILTER_BY_AMOUNT = 'filterByAmount',
  FILTER_BY_ORDERS_AMOUNT = 'filterByOrdersAmount',
  FILTER_BY_EXECUTION_PERCENT = 'filterByExecutionPercent',
}

export type Options = { [ OptKey in OptionsKeys ]: boolean };

export const enum FiltersKeys {
  FAVORITE_COUNTERPARTY = 'favoriteCounterparty',
  EXCLUDE_COUNTERPARTY = 'excludeCounterparty',
  PRICE = 'price',
  PRICE_SIGN = 'priceSign',
  AMOUNT_MIN = 'amountMin',
  AMOUNT_MAX = 'amountMax',
  ORDERS_AMOUNT = 'ordersAmount',
  EXECUTION_PERCENT = 'executionPercent'
}

export interface Filters {
  [FiltersKeys.FAVORITE_COUNTERPARTY]: string[];
  [FiltersKeys.EXCLUDE_COUNTERPARTY]: string[];
  [FiltersKeys.PRICE]: number;
  [FiltersKeys.PRICE_SIGN]: PriceSign;
  [FiltersKeys.AMOUNT_MIN]: number;
  [FiltersKeys.AMOUNT_MAX]: number;
  [FiltersKeys.ORDERS_AMOUNT]: number;
  [FiltersKeys.EXECUTION_PERCENT]: number;
}

export interface ExtensionStorage extends Options, Filters {};


