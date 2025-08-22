import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BROWSER } from '../app.config';
import { Filters, FiltersKeys, Options, OptionsKeys } from '../types';

@Injectable({
  providedIn: 'root'
})
export class BrowserStorageService {
  private readonly BROWSER: typeof browser = inject(BROWSER);

  get<T extends { [key: string]: any }>(keys: string | string[]): Observable<Partial<T>> {
    return new Observable(observer => {
      this.BROWSER.storage.sync.get(keys)
        .then((value: { [key: string]: any }) => {
          observer.next(<T>value);
          observer.complete();
        })
        .catch((err: any) => observer.error(err));
    });
  }

  set<T extends { [key: string]: any }>(value: T): Observable<void> {
    return new Observable(observer => {
      this.BROWSER.storage.sync.set(value)
        .then(() => {
          observer.next();
          observer.complete();
        })
        .catch((err: any) => observer.error(err));
    });
  }

  getOptions(): Observable<Partial<Options>> {
    return this.get<Options>([
      OptionsKeys.FILTER_BY_COUNTERPARTY,
      OptionsKeys.FILTER_BY_PRICE,
      OptionsKeys.FILTER_BY_AMOUNT,
    ]);
  }

  getFilters(): Observable<Partial<Filters>> {
    return this.get<Filters>([
      FiltersKeys.FAVORITE_COUNTERPARTY,
      FiltersKeys.EXCLUDE_COUNTERPARTY,
      FiltersKeys.PRICE,
      FiltersKeys.PRICE_SIGN,
      FiltersKeys.AMOUNT_MIN,
      FiltersKeys.AMOUNT_MAX,
    ]);
  }
}
