// common/service/arca/cuit/cuit-format.directive.ts
import { Directive, ElementRef, HostListener, Renderer2, inject } from '@angular/core';
import { NgControl } from '@angular/forms';

@Directive({
  selector: '[appCuitFormat]',
  standalone: true, // ✅ Angular 19
  exportAs: 'cuitFormat'
})
export class CuitFormatDirective {
  private control = inject(NgControl); // ✅ inject() en lugar de constructor

  constructor(
    private el: ElementRef,
    private renderer: Renderer2
  ) { }

  @HostListener('input', ['$event'])
  onInput(event: InputEvent) {
    const input = event.target as HTMLInputElement;
    let value = input.value.replace(/\D/g, '');

    if (value.length > 11) {
      value = value.substring(0, 11);
    }

    let formatted = this.formatCUIT(value);

    // Evitar loop: solo actualizar si cambia
    if (input.value !== formatted) {
      const start = input.selectionStart || 0;
      const end = input.selectionEnd || 0;
      const diff = formatted.length - input.value.length;

      this.renderer.setProperty(input, 'value', formatted);

      // Ajustar cursor inteligentemente
      input.setSelectionRange(start + diff, end + diff);
    }

    // Actualizar el modelo con SOLO dígitos
    this.control.control?.setValue(value, { emitEvent: false, emitModelToViewChange: false });
  }

  @HostListener('blur')
  onBlur() {
    const value = this.control.control?.value || '';
    const digits = String(value).replace(/\D/g, '');
    const formatted = this.formatCUIT(digits);
    this.renderer.setProperty(this.el.nativeElement, 'value', formatted);
  }

  private formatCUIT(digits: string): string {
    if (digits.length <= 2) return digits;
    if (digits.length <= 10) return `${digits.slice(0, 2)}-${digits.slice(2)}`;
    return `${digits.slice(0, 2)}-${digits.slice(2, 10)}-${digits.slice(10, 11)}`;
  }
}