import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { BrowserStorageService } from '../../services/browser-storage.service';
import { PriceSign, Options, Filters } from '../../types';

type FormGroupType = {
  excludeCounterparty: FormControl<string | null>,
  price: FormControl<number | null>,
  priceSign: FormControl<PriceSign | null>,
  topLimit: FormControl<number | null>,
  bottomLimit: FormControl<number | null>,
}

type FormGroupValue = {
  excludeCounterparty: string | null,
  price: number | null,
  priceSign: PriceSign | null,
  topLimit: number | null,
  bottomLimit: number | null,
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
    excludeCounterparty: new FormControl<string>(''),
    price: new FormControl<number>(1, [Validators.min(1)]),
    priceSign: new FormControl<PriceSign>(PriceSign.More),
    // TODO remove initial values
    topLimit: new FormControl<number>(1000),
    bottomLimit: new FormControl<number>(1, [Validators.min(1)])
  });

  ngOnInit(): void {
    forkJoin([
      this.browserStorageService.getOptions(),
      this.browserStorageService.getFilters()
    ])
    .subscribe({
      next: ([options, filters]: [Partial<Options>, Partial<Filters>]) => {
        this.form.patchValue({
          ...filters,
          excludeCounterparty: filters?.excludeCounterparty?.join(',') ?? null
        });

        if (!options?.filterByCounterparty) {
          this.form.get('excludeCounterparty')?.disable();
        }
        if (!options?.filterByPrice) {
          this.form.get('price')?.disable();
          this.form.get('priceSign')?.disable();
        }
        if (!options?.filterByBottomLimit) {
          this.form.get('bottomLimit')?.disable();
        }
        if (!options?.filterByTopLimit) {
          this.form.get('topLimit')?.disable();
        }
      },
      error: (err) => {
        console.error(`Ошибка при получении ключей 'filterByCounterparty', 'filterByPrice',
          'filterByBottomLimit', 'filterByTopLimit','notInFilterElemAction' из хранилища: ${err}`)
      }
    });
  }

  updateStorage(): void {
    this.browserStorageService.set<Omit<Partial<FormGroupValue>, 'excludeCounterparty'> & { excludeCounterparty: string[] | null }>({
      ...this.form.value,
      excludeCounterparty: this.form.value?.excludeCounterparty?.split(',') ?? null
    })
      .subscribe({
        error: (err) => {
          console.error(`Ошибка при сохрании объекта ${this.form.value} в хранилище: ${err}`)
        }
      });
  }
}
