import { Component, input } from '@angular/core';
import { MatCardModule } from '@angular/material/card';

@Component({
    selector: 'app-total-transferencia',
    imports: [MatCardModule],
    templateUrl: './total-transferencia.component.html',
    styleUrl: './total-transferencia.component.scss'
})
export class TotalTransferenciaComponent {
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