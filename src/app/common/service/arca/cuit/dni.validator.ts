// common/service/arca/cuit/cuit.validator.ts
import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { DipsUtils } from '@comun/utils';

export function dniOcuitValidator() {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value;
    if (!value) return null;

    const soloDigitos = String(value).replace(/\D/g, '');
    const len = soloDigitos.length;

    // Caso DNI: 8 dígitos (tu requerimiento)
    if (len === 8) {
      if (control.value !== soloDigitos) {
        control.setValue(soloDigitos, { emitEvent: false });
      }
      return null;
    }

    // Caso CUIT: 11 dígitos → validar con lógica existente
    if (len === 11) {
      const result = DipsUtils.validaCuit(soloDigitos);
      if (result.isValid) {
        if (control.value !== soloDigitos) {
          control.setValue(soloDigitos, { emitEvent: false });
        }
        return null;
      } else {
        return { cuitInvalid: true, message: result.message };
      }
    }

    return { dniOcuitInvalido: true };
  };
}