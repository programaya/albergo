import { Component, Input } from '@angular/core';

@Component({
    selector: 'app-total-ctacte',
    templateUrl: './total-ctacte.component.html',
    styleUrls: ['./total-ctacte.component.scss']
})
export class TotalCtacteComponent {
    @Input() total: number = 0;

    getEnteros(): string {
        return Math.floor(this.total).toLocaleString('es-AR');
    }

    getDecimales(): string {
        return (this.total % 1).toFixed(2).slice(2);
    }
}