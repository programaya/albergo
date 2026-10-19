import { Component, input } from '@angular/core';
import { MatCardModule } from '@angular/material/card';

@Component({
    selector: 'app-total-billetera',
    imports: [MatCardModule],
    templateUrl: './total-billetera.component.html',
    styleUrl: './total-billetera.component.scss'
})
export class TotalBilleteraComponent {
    total = input<number>(0); // Solo lectura

    // Obtiene la parte entera formateada con puntos de miles
    getEnteros(): string {
        const valor = this.total();
        return Math.floor(valor).toLocaleString('es-AR');
    }

    // Obtiene exactamente los 2 dígitos decimales
    getDecimales(): string {
        const valor = this.total();
        return (valor % 1).toFixed(2).slice(2);
    }
}