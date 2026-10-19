import { Component, input } from '@angular/core';
import { MatCardModule } from '@angular/material/card';

@Component({
    selector: 'app-total-ctacte',
    imports: [MatCardModule],
    templateUrl: './total-ctacte.component.html',
    styleUrl: './total-ctacte.component.scss'
})
export class TotalCtacteComponent {
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