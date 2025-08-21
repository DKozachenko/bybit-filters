import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { FormGroupValue } from '../components/popup/popup.component';

export function amountValidator(): ValidatorFn {
  return (control: AbstractControl<FormGroupValue>): ValidationErrors | null => {
    if (control.value.amountMin && control.value.amountMax) {
      if (control.value.amountMin > control.value.amountMax) {
        return { 'bottom limit is more than top limit': true };
      }
    }

    return null;
  }
}
