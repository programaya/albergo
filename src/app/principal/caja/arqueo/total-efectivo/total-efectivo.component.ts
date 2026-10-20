import { Component, Input } from '@angular/core';

@Component({
    selector: 'app-total-efectivo',
    templateUrl: './total-efectivo.component.html',
    styleUrls: ['./total-efectivo.component.scss'] // En Angular 13 es un arreglo
})
export class TotalEfectivoComponent {
    @Input() total: number = 0; // Entrada clásica con valor por defecto

    // Obtiene la parte entera formateada con puntos de miles
    getEnteros(): string {
        return Math.floor(this.total).toLocaleString('es-AR');
    }

    // Obtiene exactamente los 2 dígitos decimales
    getDecimales(): string {
        return (this.total % 1).toFixed(2).slice(2);
    }
}