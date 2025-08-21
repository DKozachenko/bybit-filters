import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { BrowserStorageService } from '../../services/browser-storage.service';
import { PriceSign, Options, Filters } from '../../types';
import { amountValidator } from '../../validators/amount.validator';

type FormGroupType = {
  excludeCounterparty: FormControl<string | null>,
  favoriteCounterparty: FormControl<string | null>,
  price: FormControl<number | null>,
  priceSign: FormControl<PriceSign | null>,
  amountMin: FormControl<number | null>,
  amountMax: FormControl<number | null>,
}

export type FormGroupValue = {
  favoriteCounterparty: string | null,
  excludeCounterparty: string | null,
  price: number | null,
  priceSign: PriceSign | null,
  amountMin: number | null,
  amountMax: number | null,
}

@Component({
  selector: 'app-popup',
  imports: [ReactiveFormsModule],
  templateUrl: './popup.component.html',
  styleUrl: './popup.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PopupComponent implements OnInit {
  private readonly browserStorageService: BrowserStorageService = inject(BrowserStorageService);
  protected readonly PriceSign = PriceSign;

  protected form: FormGroup<FormGroupType> = new FormGroup<FormGroupType>({
    favoriteCounterparty: new FormControl<string | null>(null),
    excludeCounterparty: new FormControl<string | null>(null),
    price: new FormControl<number | null>(null, [Validators.min(1)]),
    priceSign: new FormControl<PriceSign | null>(null),
    amountMin: new FormControl<number | null>(null, [Validators.min(1)]),
    amountMax: new FormControl<number | null>(null),
  }, [amountValidator()]);

  ngOnInit(): void {
    forkJoin([
      this.browserStorageService.getOptions(),
      this.browserStorageService.getFilters()
    ])
    .subscribe({
      next: ([options, filters]: [Partial<Options>, Partial<Filters>]) => {
        this.form.patchValue({
          ...filters,
          favoriteCounterparty: filters?.favoriteCounterparty?.join(',') ?? null,
          excludeCounterparty: filters?.excludeCounterparty?.join(',') ?? null
        });

        if (!options?.filterByCounterparty) {
          this.form.get('excludeCounterparty')?.disable();
          this.form.get('favoriteCounterparty')?.disable();
        }
        if (!options?.filterByPrice) {
          this.form.get('price')?.disable();
          this.form.get('priceSign')?.disable();
        }
        if (!options?.filterByAmount) {
          this.form.get('amountMin')?.disable();
          this.form.get('amountMax')?.disable();
        }
      },
      error: (err) => {
        console.error(`Ошибка при получении ключей 'filterByCounterparty', 'filterByPrice',
          'filterByAmount' из хранилища: ${err}`)
      }
    });
  }

  updateStorage(): void {
    this.browserStorageService.set<Omit<Partial<FormGroupValue>, 'excludeCounterparty' | 'favoriteCounterparty'> & { excludeCounterparty: string[] | null, favoriteCounterparty: string[] | null }>({
      ...this.form.value,
      favoriteCounterparty: this.form.value?.favoriteCounterparty?.split(',') ?? null,
      excludeCounterparty: this.form.value?.excludeCounterparty?.split(',') ?? null
    })
      .subscribe({
        error: (err) => {
          console.error(`Ошибка при сохранении объекта ${this.form.value} в хранилище: ${err}`)
        }
      });
  }
}
