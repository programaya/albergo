import { Component, OnInit, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { CommonModule, registerLocaleData } from '@angular/common';
import localeEsAr from '@angular/common/locales/es-AR';
import { Caja } from '@dbTabla/caja.model';

registerLocaleData(localeEsAr, 'es-AR');

@Component({
    selector: 'app-modal-gastos',
    templateUrl: './modal-gastos.component.html',
    styleUrls: ['./modal-gastos.component.scss']
})
export class ModalGastosComponent implements OnInit {
    cajaClonada!: Caja;
    gastoForm: FormGroup;
    columnasTabla: string[] = ['descripcion', 'monto'];
    dataSource = new MatTableDataSource<any>([]);

    constructor(
        public dialogRef: MatDialogRef<ModalGastosComponent>,
        @Inject(MAT_DIALOG_DATA) public data: { caja: Caja | null },
        private fb: FormBuilder
    ) {
        this.gastoForm = this.fb.group({
            descripcion: ['', [Validators.required]],
            monto: [null, [Validators.required]]
        });
    }

    ngOnInit(): void {
        const cajaBase = this.data?.caja || {};
        this.cajaClonada = JSON.parse(JSON.stringify(cajaBase));
        if (!this.cajaClonada.gastos) {
            this.cajaClonada.gastos = [];
        } else {
            this.cajaClonada.gastos = this.cajaClonada.gastos.filter(
                (g: any) => g && g.descripcion && g.descripcion.trim() !== '' && !isNaN(Number(g.monto))
            );
        }
        this.dataSource.data = this.cajaClonada.gastos;
    }

    agregarGasto(primerInput?: HTMLInputElement) {
        if (this.gastoForm.invalid) {
            this.gastoForm.markAllAsTouched();
            return;
        }
        const { descripcion, monto } = this.gastoForm.value;
        const descripcionLimpia = descripcion ? descripcion.trim() : '';
        const montoNumerico = Number(monto);
        if (!descripcionLimpia || isNaN(montoNumerico)) {
            return;
        }
        const nuevoGasto = {
            descripcion: descripcionLimpia,
            monto: montoNumerico
        };
        if (!this.cajaClonada) {
            this.cajaClonada = {} as Caja;
        }
        if (!this.cajaClonada.gastos) {
            this.cajaClonada.gastos = [];
        }
        this.cajaClonada.gastos = [...this.cajaClonada.gastos, nuevoGasto];
        this.dataSource.data = this.cajaClonada.gastos;
        this.gastoForm.reset();
        if (primerInput) {
            setTimeout(() => {
                primerInput.focus();
            }, 50);
        }
    }

    cerrarYGuardar() {
        this.dialogRef.close(this.cajaClonada);
    }
}