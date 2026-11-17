import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-total-transferencia', // cambiar según componente
  templateUrl: './total-transferencia.component.html',
  styleUrls: ['./total-transferencia.component.scss']
})
export class TotalTransferenciaComponent {
  @Input() total: number = 0;

  getEnteros(): string {
    return Math.floor(this.total).toLocaleString('es-AR');
  }

  getDecimales(): string {
    return (this.total % 1).toFixed(2).slice(2);
  }
}