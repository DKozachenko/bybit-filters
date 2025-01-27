import { ChangeDetectionStrategy, Component, inject, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { debounceTime, distinctUntilChanged, Subscription, switchMap } from 'rxjs';
import { BrowserStorageService } from '../../services/browser-storage.service';
import { NotInFilterElemAction, Storage } from '../../types';

type FormGroupType = {
  filterByCounterparty: FormControl<boolean | null>;
  filterByPrice: FormControl<boolean | null>;
  filterByBottomLimit: FormControl<boolean | null>;
  filterByTopLimit: FormControl<boolean | null>;
  notInFilterElemAction: FormControl<NotInFilterElemAction | null>;
}

type FormGroupValue = {
  filterByCounterparty: boolean | null;
  filterByPrice: boolean | null;
  filterByBottomLimit: boolean | null;
  filterByTopLimit: boolean | null;
  notInFilterElemAction: NotInFilterElemAction | null;
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

  protected readonly NotInFilterElemAction = NotInFilterElemAction;

  form: FormGroup<FormGroupType> = new FormGroup({
    filterByCounterparty: new FormControl<boolean>(false),
    filterByPrice: new FormControl<boolean>(false),
    filterByBottomLimit: new FormControl<boolean>(false),
    filterByTopLimit: new FormControl<boolean>(false),
    notInFilterElemAction: new FormControl<NotInFilterElemAction>(NotInFilterElemAction.Darken)
  });

  ngOnInit(): void {
    this.browserStorageService.get<Storage>([
      'filterByCounterparty',
      'filterByPrice',
      'filterByBottomLimit',
      'filterByTopLimit',
      'notInFilterElemAction'
    ]).subscribe({
      next: (value: Partial<Storage>) => {
        this.form.patchValue(value);
      },
      error: (err) => {
        console.error(`Ошибка при получении ключей 'filterByCounterparty', 'filterByPrice',
          'filterByBottomLimit', 'filterByTopLimit','notInFilterElemAction' из хранилища: ${err}`)
      }
    });

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

  ngOnDestroy(): void {
    this.formSubscription.unsubscribe();
  }
}
