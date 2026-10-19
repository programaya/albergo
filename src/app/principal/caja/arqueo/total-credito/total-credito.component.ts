import { Component, input } from '@angular/core';
import { MatCardModule } from '@angular/material/card';

@Component({
    selector: 'app-total-credito',
    imports: [MatCardModule],
    templateUrl: './total-credito.component.html',
    styleUrl: './total-credito.component.scss'
})
export class TotalCreditoComponent {
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