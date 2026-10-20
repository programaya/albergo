// app/principal/caja/arqueo/monto-arqueo/monto-arqueo.component.ts
import { Component, Input, Output, EventEmitter, ElementRef, HostListener, AfterViewInit } from '@angular/core';
import { Caja } from '../../caja.model';

@Component({
  selector: 'app-monto-arqueo',
  templateUrl: './monto-arqueo.component.html',
  styleUrls: ['./monto-arqueo.component.scss']
})
export class MontoArqueoComponent implements AfterViewInit {
  @Input() cajaData: Caja | null = null;
  @Input() total: number = 0;
  @Output() totalChange = new EventEmitter<number>();

  editando = false;
  diferencia = 0;

  constructor(private el: ElementRef) { }

  ngAfterViewInit(): void {
    this.calcularDiferencia();
  }

  private calcularDiferencia(): void {
    const gastos = (this.cajaData?.gastos || []).reduce((a, g) => a + (g.monto || 0), 0);
    this.diferencia = (this.total || 0)
      - (this.cajaData?.totales?.efectivo || 0)
      - (this.cajaData?.montoInicial || 0)
      - gastos;
  }

  activarEdicion(): void {
    this.editando = true;
    setTimeout(() => {
      const input = this.el.nativeElement.querySelector('.monto-input') as HTMLInputElement;
      if (input) { input.focus(); input.select(); }
    }, 50);
  }

  desactivarEdicion(valorStr: string): void {
    if (!this.editando) return;
    const limpio = valorStr.replace(/\./g, '').replace(',', '.');
    const numero = parseFloat(limpio) || 0;
    this.total = numero;
    this.totalChange.emit(this.total);
    this.editando = false;
    this.calcularDiferencia();
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