// common/service/arca/cuit/cuit.validator.ts
import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { DipsUtils } from '@comun/utils';

export function cuitValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const result = DipsUtils.validaCuit(control.value);

    if (result.isValid) {
      return null;
    }

    // Devolvemos el error con el mensaje
    return {
      cuitInvalid: true,
      message: result.message
    };
  };

}