import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-total-credito', // cambiar según componente
  templateUrl: './total-credito.component.html',
  styleUrls: ['./total-credito.component.scss']
})
export class TotalCreditoComponent {
  @Input() total: number = 0;

  getEnteros(): string {
    return Math.floor(this.total).toLocaleString('es-AR');
  }

  getDecimales(): string {
    return (this.total % 1).toFixed(2).slice(2);
  }
}