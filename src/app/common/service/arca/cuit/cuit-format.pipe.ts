// common/service/arca/cuit/cuit-format.pipe.ts
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'cuitFormat',
  standalone: true // ✅
})
export class CuitFormatPipe implements PipeTransform {
  transform(value: any): string {
    if (!value) return '';
    const digits = String(value).replace(/\D/g, '');
    if (digits.length <= 2) return digits;
    if (digits.length <= 10) return `${digits.slice(0, 2)}-${digits.slice(2)}`;
    return `${digits.slice(0, 2)}-${digits.slice(2, 10)}-${digits.slice(10, 11)}`;
  }
}