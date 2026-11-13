import { Component, Input, Output, EventEmitter, ViewChild, TemplateRef } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { Caja, totalMovimientosManuales } from '../arqueo.model';

@Component({
    selector: 'app-monto-arqueo',
    templateUrl: './monto-arqueo.component.html',
    styleUrls: ['./monto-arqueo.component.scss']
})
export class MontoArqueoComponent {
    @Input() cajaData: Caja | null = null;
    @Input() total: number = 0;
    @Output() totalChange = new EventEmitter<number>();

    @ViewChild('modalMontoRendido') modalMontoRendido!: TemplateRef<any>;
    montoControl = new FormControl(null, [Validators.required, Validators.min(0)]);
    private modalAbierto = false;

    constructor(private dialog: MatDialog) { }

    get puedeEditar(): boolean {
        return this.total === 0 &&
            !this.cajaData?.movimientos.some(movimiento => movimiento.datos === 'A') &&
            !!this.cajaData && !this.cajaData.cerrada;
    }

    get diferencia(): number {
        return this.total - (this.cajaData?.totales?.efectivo || 0) -
            (this.cajaData?.montoInicial || 0) - totalMovimientosManuales(this.cajaData);
    }

    activarEdicion(): void {
        if (!this.puedeEditar || this.modalAbierto) return;
        this.montoControl.reset();
        this.modalAbierto = true;
        const referencia = this.dialog.open(this.modalMontoRendido, { id: 'monto-rendido', width: '400px' });
        referencia.afterClosed().subscribe((monto: number | undefined) => {
            this.modalAbierto = false;
            if (monto !== undefined && this.puedeEditar) {
                this.totalChange.emit(monto);
            }
        });
    }

    aceptarMonto(): void {
        const monto = Number(this.montoControl.value);
        if (this.montoControl.invalid || !Number.isFinite(monto) || monto < 0) {
            this.montoControl.markAsTouched();
            return;
        }
        this.dialog.getDialogById('monto-rendido')?.close(monto);
    }

    getEnteros(): string {
        return Math.floor(this.total).toLocaleString('es-AR');
    }

    getDecimales(): string {
        return (this.total % 1).toFixed(2).slice(2);
    }
}
