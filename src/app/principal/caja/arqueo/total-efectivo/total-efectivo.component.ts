import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-total-efectivo', // cambiar según componente
  templateUrl: './total-efectivo.component.html',
  styleUrls: ['./total-efectivo.component.scss']
})
export class TotalEfectivoComponent {
  @Input() total: number = 0;

  getEnteros(): string {
    return Math.floor(this.total).toLocaleString('es-AR');
  }

  getDecimales(): string {
    return (this.total % 1).toFixed(2).slice(2);
  }
}