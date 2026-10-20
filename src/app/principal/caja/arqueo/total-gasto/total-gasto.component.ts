import { Component, Input, Output, EventEmitter } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Caja } from '@dbTabla/caja.model';
import { ModalGastosComponent } from '../modal-gastos/modal-gastos.componet';

@Component({
    selector: 'app-total-gasto',
    templateUrl: './total-gasto.component.html',
    styleUrls: ['./total-gasto.component.scss']
})
export class TotalGastoComponent {
    @Input() total: number = 0;
    @Input() caja: Caja | null = null;
    @Output() cajaModificada = new EventEmitter<Caja>();

    constructor(private dialog: MatDialog) { }

    abrirModalGastos() {
        if (this.caja?.cerrada) return;

        const dialogRef = this.dialog.open(ModalGastosComponent, {
            width: '500px',
            disableClose: true,
            data: { caja: this.caja }
        });

        dialogRef.afterClosed().subscribe((cajaActualizada: Caja | undefined) => {
            console.log('Modal cerrado. Caja actualizada:', cajaActualizada);
            if (cajaActualizada) {
                this.cajaModificada.emit(cajaActualizada);
            }
        });
    }

    getEnteros(): string {
        const parteEntera = this.total >= 0 ? Math.floor(this.total) : Math.ceil(this.total);
        return parteEntera.toLocaleString('es-AR');
    }

    getDecimales(): string {
        const valor = Math.abs(this.total);
        return (valor % 1).toFixed(2).slice(2);
    }
}