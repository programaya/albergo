import { Directive, HostListener } from '@angular/core';
import { NgControl } from '@angular/forms';

@Directive({
  selector: '[formControlName][dipsCuitMask]',
}   )
export class DipsCuitMaskDirective {

  constructor(public ngControl: NgControl) { }

  @HostListener('ngModelChange', ['$event'])
  onModelChange(event: any) {
    this.onInputChange(event);
  }

  onInputChange(event: any) {

    let nuevoValor = event.replace(/\D/g, '');


    if (nuevoValor.length > 11){
      nuevoValor = nuevoValor.substring(0, nuevoValor.length - 1);  // mayor a 11 no acepta mas datos

    }

    if (nuevoValor.length === 0) {
      nuevoValor = '';

    // } else if (nuevoValor.length > 8 && nuevoValor.length <= 10) {
    //   nuevoValor = nuevoValor.replace(/^(\d{0,2})(\d{0,8})/, '$1-$2');

    } else if (nuevoValor.length == 11) {
      nuevoValor = nuevoValor.replace(/^(\d{0,2})(\d{0,8})(\d{0,1})/, '$1-$2-$3');
    }


    this.ngControl.valueAccessor!.writeValue(nuevoValor);
  }
}
