import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Caja, MovimientoCaja } from '../arqueo.model';

@Component({
    selector: 'app-modal-movimientos',
    templateUrl: './modal-movimientos.component.html',
    styleUrls: ['./modal-movimientos.component.scss']
})
export class ModalMovimientosComponent implements OnInit {
    cajaClonada!: Caja;
    movimientoForm!: FormGroup;
    ajustesAgregados = 0;

    constructor(
        public dialogRef: MatDialogRef<ModalMovimientosComponent>,
        @Inject(MAT_DIALOG_DATA) public data: { caja: Caja | null; usuario: string },
        private _fb: FormBuilder
    ) { }

    ngOnInit(): void {
        this.movimientoForm = this._fb.group({
            descripcion: ['', [Validators.required]],
            monto: [null, [Validators.required]]
        });

        const cajaBase = this.data?.caja;
        this.cajaClonada = new Caja(cajaBase);
        this.cajaClonada.movimientos = [...this.cajaClonada.movimientos];

    }

    agregarMovimiento(primerInput?: HTMLInputElement) {
        if (this.movimientoForm.invalid) {
            this.movimientoForm.markAllAsTouched();
            return;
        }
        const { descripcion, monto } = this.movimientoForm.value;
        const descripcionLimpia = descripcion ? descripcion.trim() : '';
        const montoNumerico = Number(monto);
        if (!descripcionLimpia || !Number.isFinite(montoNumerico) || montoNumerico === 0) return;

        const nuevoMovimiento: MovimientoCaja = {
            fechaInicio: new Date(),
            fechaFin: new Date(),
            tipo: 'Ajuste',
            descripcion: descripcionLimpia,
            monto: montoNumerico,
            usuario: this.data.usuario,
            datos: '7'
        };

        this.cajaClonada.movimientos = [...this.cajaClonada.movimientos, nuevoMovimiento];
        this.ajustesAgregados++;
        this.movimientoForm.reset();

        if (primerInput) {
            setTimeout(() => primerInput.focus(), 50);
        }
    }

    cerrarYGuardar() {
        this.dialogRef.close(this.ajustesAgregados > 0 ? this.cajaClonada : undefined);
    }
}
