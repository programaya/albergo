import { Component, Input } from '@angular/core';

@Component({
    selector: 'app-total-debito',
    templateUrl: './total-debito.component.html',
    styleUrls: ['./total-debito.component.scss']
})
export class TotalDebitoComponent {
    @Input() total: number = 0;

    getEnteros(): string {
        return Math.floor(this.total).toLocaleString('es-AR');
    }

    getDecimales(): string {
        return (this.total % 1).toFixed(2).slice(2);
    }
}