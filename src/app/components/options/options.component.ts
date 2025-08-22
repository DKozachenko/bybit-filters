import { ChangeDetectionStrategy, Component, inject, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { debounceTime, distinctUntilChanged, Subscription, switchMap } from 'rxjs';
import { BrowserStorageService } from '../../services/browser-storage.service';
import { Options, OptionsKeys } from '../../types';

type FormGroupType = { [ OptKey in OptionsKeys ]: FormControl<boolean | null> };

type FormGroupValue = { [ OptKey in OptionsKeys ]: boolean | null };

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
    [OptionsKeys.FILTER_BY_COUNTERPARTY]: new FormControl<boolean>(false),
    [OptionsKeys.FILTER_BY_PRICE]: new FormControl<boolean>(false),
    [OptionsKeys.FILTER_BY_AMOUNT]: new FormControl<boolean>(false),
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
        console.error(`Ошибка при получении ключей '${OptionsKeys.FILTER_BY_COUNTERPARTY}', '${OptionsKeys.FILTER_BY_PRICE}',
          '${OptionsKeys.FILTER_BY_AMOUNT}' из хранилища: ${err}`);
      }
    });
  }

  ngOnDestroy(): void {
    this.formSubscription.unsubscribe();
  }
}
