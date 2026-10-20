// app/principal/caja/arqueo/monto-inicial/monto-inicial.component.ts
import { Component, Input, Output, EventEmitter, ElementRef, HostListener, AfterViewInit } from '@angular/core';
import { Caja } from '../../caja.model';

@Component({
  selector: 'app-monto-inicial',
  templateUrl: './monto-inicial.component.html',
  styleUrls: ['./monto-inicial.component.scss']
})
export class MontoInicialComponent implements AfterViewInit {
  @Input() cajaData: Caja | null = null;
  @Input() total: number = 0;
  @Output() totalChange = new EventEmitter<number>();

  editando = false;

  constructor(private el: ElementRef) { }

  ngAfterViewInit(): void { }

  get puedeEditar(): boolean {
    if (this.total !== 0) return false;
    if (this.cajaData === null) return true;
    if (this.cajaData.cerrada === false) return true;
    return false;
  }

  activarEdicion(): void {
    if (this.puedeEditar) {
      this.editando = true;
      setTimeout(() => {
        const input = this.el.nativeElement.querySelector('.monto-input') as HTMLInputElement;
        if (input) { input.focus(); input.select(); }
      }, 50);
    }
  }

  desactivarEdicion(valorStr: string): void {
    if (!this.editando) return;
    const limpio = valorStr.replace(/\./g, '').replace(',', '.');
    let numero = parseFloat(limpio) || 0;
    if (numero < 0) numero = 0;
    this.total = numero;
    this.totalChange.emit(this.total);
    this.editando = false;
  }

  @HostListener('document:click', ['$event'])
  onClickOutside(event: MouseEvent): void {
    if (this.editando && !this.el.nativeElement.contains(event.target as Node)) {
      const input = this.el.nativeElement.querySelector('.monto-input') as HTMLInputElement;
      if (input) this.desactivarEdicion(input.value);
    }
  }

  getEnteros(): string {
    return Math.floor(this.total).toLocaleString('es-AR');
  }

  getDecimales(): string {
    return (this.total % 1).toFixed(2).slice(2);
  }
}