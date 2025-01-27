import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BROWSER } from '../types';

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
        .catch(err => observer.error(err));
    });
  }

  set<T extends { [key: string]: any }>(value: T): Observable<void> {
    return new Observable(observer => {
      this.BROWSER.storage.sync.set(value)
        .then(() => {
          observer.next();
          observer.complete();
        })
        .catch(err => observer.error(err));
    });
  }
}
