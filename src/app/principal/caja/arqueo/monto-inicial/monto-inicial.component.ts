import { Component, Input, Output, EventEmitter, ViewChild, TemplateRef } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { Caja } from '../arqueo.model';

@Component({
    selector: 'app-monto-inicial',
    templateUrl: './monto-inicial.component.html',
    styleUrls: ['./monto-inicial.component.scss']
})
export class MontoInicialComponent {
    @Input() cajaData: Caja | null = null;
    @Input() total: number = 0;
    @Input() guardando = false;
    @Output() totalChange = new EventEmitter<number>();

    @ViewChild('modalMontoInicial') modalMontoInicial!: TemplateRef<any>;
    montoControl = new FormControl(null, [Validators.required, Validators.min(0)]);
    private modalAbierto = false;

    constructor(private dialog: MatDialog) { }

    get puedeEditar(): boolean {
        return !this.guardando && this.total === 0 &&
            !this.cajaData?.movimientos.some(movimiento => movimiento.datos === '9') &&
            (!this.cajaData || !this.cajaData.cerrada);
    }

    activarEdicion(): void {
        if (!this.puedeEditar || this.modalAbierto) return;
        this.montoControl.reset();
        this.modalAbierto = true;
        const referencia = this.dialog.open(this.modalMontoInicial, { id: 'saldo-inicial', width: '400px' });
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
        // Cierra únicamente el modal de saldo inicial con el importe confirmado.
        this.dialog.getDialogById('saldo-inicial')?.close(monto);
    }

    getEnteros(): string {
        return Math.floor(this.total).toLocaleString('es-AR');
    }

    getDecimales(): string {
        return (this.total % 1).toFixed(2).slice(2);
    }
}
