import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { BrowserStorageService } from '../../services/browser-storage.service';
import { PriceSign, Options, Filters, FiltersKeys, OptionsKeys } from '../../types';
import { amountValidator } from '../../validators/amount.validator';

export type FormGroupValue = {
  [FiltersKeys.EXCLUDE_COUNTERPARTY]: string | null,
  [FiltersKeys.FAVORITE_COUNTERPARTY]: string | null,
  [FiltersKeys.PRICE]: number | null,
  [FiltersKeys.PRICE_SIGN]: PriceSign | null,
  [FiltersKeys.AMOUNT_MIN]: number | null,
  [FiltersKeys.AMOUNT_MAX]: number | null,
  [FiltersKeys.ORDERS_AMOUNT]: number | null,
  [FiltersKeys.EXECUTION_PERCENT]: number | null,
}

export type FormGroupType = { [ FgValueKey in keyof FormGroupValue ]: FormControl<FormGroupValue[FgValueKey]> };

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
    [FiltersKeys.FAVORITE_COUNTERPARTY]: new FormControl<string | null>(null),
    [FiltersKeys.EXCLUDE_COUNTERPARTY]: new FormControl<string | null>(null),
    [FiltersKeys.PRICE]: new FormControl<number | null>(null, [Validators.min(1)]),
    [FiltersKeys.PRICE_SIGN]: new FormControl<PriceSign | null>(null),
    [FiltersKeys.AMOUNT_MIN]: new FormControl<number | null>(null, [Validators.min(1)]),
    [FiltersKeys.AMOUNT_MAX]: new FormControl<number | null>(null),
    [FiltersKeys.ORDERS_AMOUNT]: new FormControl<number | null>(null, [Validators.min(1)]),
    [FiltersKeys.EXECUTION_PERCENT]: new FormControl<number | null>(null, [Validators.min(1), Validators.max(100)]),
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
          [FiltersKeys.FAVORITE_COUNTERPARTY]: filters?.[FiltersKeys.FAVORITE_COUNTERPARTY]?.join(',') ?? null,
          [FiltersKeys.EXCLUDE_COUNTERPARTY]: filters?.[FiltersKeys.EXCLUDE_COUNTERPARTY]?.join(',') ?? null
        });

        if (!options?.[OptionsKeys.FILTER_BY_COUNTERPARTY]) {
          this.form.get(FiltersKeys.FAVORITE_COUNTERPARTY)?.disable();
          this.form.get(FiltersKeys.EXCLUDE_COUNTERPARTY)?.disable();
        }
        if (!options?.[OptionsKeys.FILTER_BY_PRICE]) {
          this.form.get(FiltersKeys.PRICE)?.disable();
          this.form.get(FiltersKeys.PRICE_SIGN)?.disable();
        }
        if (!options?.[OptionsKeys.FILTER_BY_AMOUNT]) {
          this.form.get(FiltersKeys.AMOUNT_MIN)?.disable();
          this.form.get(FiltersKeys.AMOUNT_MAX)?.disable();
        }

        if (!options?.[OptionsKeys.FILTER_BY_ORDERS_AMOUNT]) {
          this.form.get(FiltersKeys.ORDERS_AMOUNT)?.disable();
        }

        if (!options?.[OptionsKeys.FILTER_BY_EXECUTION_PERCENT]) {
          this.form.get(FiltersKeys.EXECUTION_PERCENT)?.disable();
        }
      },
      error: (err) => {
        console.error(`Ошибка при получении ключей '${OptionsKeys.FILTER_BY_COUNTERPARTY}', '${OptionsKeys.FILTER_BY_PRICE}',
          '${OptionsKeys.FILTER_BY_AMOUNT}', '${OptionsKeys.FILTER_BY_ORDERS_AMOUNT}', '${OptionsKeys.FILTER_BY_EXECUTION_PERCENT}' из хранилища: ${err}`);
      }
    });
  }

  updateStorage(): void {
    this.browserStorageService.set<Omit<Partial<FormGroupValue>, FiltersKeys.EXCLUDE_COUNTERPARTY | FiltersKeys.FAVORITE_COUNTERPARTY>
      & {
        [FiltersKeys.EXCLUDE_COUNTERPARTY]: string[] | null,
        [FiltersKeys.FAVORITE_COUNTERPARTY]: string[] | null }>({
      ...this.form.value,
      [FiltersKeys.EXCLUDE_COUNTERPARTY]: this.form.value?.[FiltersKeys.EXCLUDE_COUNTERPARTY]?.split(',') ?? null,
      [FiltersKeys.FAVORITE_COUNTERPARTY]: this.form.value?.[FiltersKeys.FAVORITE_COUNTERPARTY]?.split(',') ?? null
    })
      .subscribe({
        error: (err) => {
          console.error(`Ошибка при сохранении объекта ${this.form.value} в хранилище: ${err}`)
        }
      });
  }
}
