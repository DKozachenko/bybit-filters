import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { FormGroupValue } from '../components/popup/popup.component';

export function limitValidator(): ValidatorFn {
  return (control: AbstractControl<FormGroupValue>): ValidationErrors | null => {
    if (control.value.bottomLimit && control.value.topLimit) {
      if (control.value.bottomLimit >= control.value.topLimit) {
        return { 'bottom limit is more than top limit': true };
      }
    }

    return null;
  }
}
