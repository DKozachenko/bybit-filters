import { ChangeDetectionStrategy, Component, inject, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { debounceTime, distinctUntilChanged, Subscription, switchMap } from 'rxjs';
import { BrowserStorageService } from '../../services/browser-storage.service';
import { Options } from '../../types';

type FormGroupType = {
  filterByCounterparty: FormControl<boolean | null>;
  filterByPrice: FormControl<boolean | null>;
  filterByBottomLimit: FormControl<boolean | null>;
  filterByTopLimit: FormControl<boolean | null>;
}

type FormGroupValue = {
  filterByCounterparty: boolean | null;
  filterByPrice: boolean | null;
  filterByBottomLimit: boolean | null;
  filterByTopLimit: boolean | null;
}

@Component({
  selector: 'app-options',
  templateUrl: './options.component.html',
  styleUrl: './options.component.scss',
  imports: [ReactiveFormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OptionsComponent implements OnInit, OnDestroy {
  private readonly browserStorageService: BrowserStorageService = inject(BrowserStorageService);
  private formSubscription!: Subscription;

  protected form: FormGroup<FormGroupType> = new FormGroup({
    filterByCounterparty: new FormControl<boolean>(false),
    filterByPrice: new FormControl<boolean>(false),
    filterByBottomLimit: new FormControl<boolean>(false),
    filterByTopLimit: new FormControl<boolean>(false),
  });

  ngOnInit(): void {
    this.patchFormByOptions();

    this.formSubscription = this.form.valueChanges
      .pipe(
        debounceTime(500),
        distinctUntilChanged(),
        switchMap((value: Partial<FormGroupValue>) => this.browserStorageService.set<Partial<FormGroupValue>>(value))
      )
      .subscribe({
        error: (err) => {
          console.error(`Ошибка при сохрании объекта ${this.form.value} в хранилище: ${err}`)
        }
      });
  }

  private patchFormByOptions(): void {
    this.browserStorageService.getOptions().subscribe({
      next: (value: Partial<Options>) => {
        this.form.patchValue(value);
      },
      error: (err) => {
        console.error(`Ошибка при получении ключей 'filterByCounterparty', 'filterByPrice',
          'filterByBottomLimit', 'filterByTopLimit' из хранилища: ${err}`)
      }
    });
  }

  ngOnDestroy(): void {
    this.formSubscription.unsubscribe();
  }
}
