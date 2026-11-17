import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-total-billetera', // cambiar según componente
  templateUrl: './total-billetera.component.html',
  styleUrls: ['./total-billetera.component.scss']
})
export class TotalBilleteraComponent {
  @Input() total: number = 0;

  getEnteros(): string {
    return Math.floor(this.total).toLocaleString('es-AR');
  }

  getDecimales(): string {
    return (this.total % 1).toFixed(2).slice(2);
  }
}