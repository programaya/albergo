Project files:

File: albergo/src/app/principal/caja/arqueo/modal-gastos/modal-gastos.component.html

```html
<!-- 👈 El título ahora usa flexbox para alojar el botón de cierre a la derecha -->
<h2 mat-dialog-title class="dialog-title">
    <span>Registro de Gastos</span>
    <button mat-icon-button mat-dialog-close aria-label="Cerrar ventana" class="close-btn">
        <mat-icon>close</mat-icon>
    </button>
</h2>

<mat-dialog-content>
    <form [formGroup]="gastoForm" class="gasto-form" (ngSubmit)="agregarGasto(txtDescripcion)">
        <mat-form-field appearance="fill">
            <mat-label>Descripción</mat-label>
            <input matInput formControlName="descripcion" #txtDescripcion placeholder="Ej. Pago Proveedor"
                autocomplete="off">
        </mat-form-field>

        <mat-form-field appearance="fill">
            <mat-label>Monto</mat-label>
            <input matInput type="number" formControlName="monto" placeholder="0.00" autocomplete="off">
        </mat-form-field>

        <button mat-mini-fab color="primary" type="submit" [disabled]="gastoForm.invalid" matTooltip="Agregar gasto">
            +
        </button>
    </form>

    <table mat-table [dataSource]="dataSource" class="mat-elevation-z1"
        *ngIf="dataSource.data.length > 0; else noMovimientos">

        <ng-container matColumnDef="descripcion">
            <th mat-header-cell *matHeaderCellDef> Descripción </th>
            <td mat-cell *matCellDef="let element"> {{element.descripcion}} </td>
        </ng-container>

        <ng-container matColumnDef="monto">
            <th mat-header-cell *matHeaderCellDef> Monto </th>
            <td mat-cell *matCellDef="let element"> {{element.monto | number:'1.2-2':'es-AR'}} </td>
        </ng-container>

        <tr mat-header-row *matHeaderRowDef="columnasTabla"></tr>
        <tr mat-row *matRowDef="let row; columns: columnasTabla;"></tr>
    </table>

    <ng-template #noMovimientos>
        <p class="no-data">No hay movimientos registrados.</p>
    </ng-template>
</mat-dialog-content>

<mat-dialog-actions align="end">
    <!-- 👈 Solo queda el botón principal de acción positiva -->
    <button mat-raised-button color="primary" (click)="cerrarYGuardar()">Salir y Guardar</button>
</mat-dialog-actions>
```

File: albergo/src/app/principal/caja/arqueo/modal-gastos/modal-gastos.component.scss

```text
// Contenedor del historial con scroll
.mb-3 {
    max-height: 220px;
    overflow-y: auto;
    border: 1px solid rgba(0, 0, 0, 0.12);
    border-radius: 6px;
    background-color: #fafafa;
}

// Estilos de la tabla de Angular Material
table {
    width: 100%;
    background: transparent;

    th.mat-mdc-header-cell {
        background-color: #f1f3f4;
        color: #3c4043;
        font-weight: 600;
        font-size: 14px;
        padding: 12px;
    }

    td.mat-mdc-cell {
        font-size: 14px;
        padding: 12px;
        color: #202124;
        border-bottom: 1px solid rgba(0, 0, 0, 0.06);
    }

    tr.mat-mdc-row:hover {
        background-color: rgba(0, 0, 0, 0.02);
    }
}

// Clases utilitarias semánticas para los montos
.text-success {
    color: #1e7e34 !important;
    font-weight: 500;
}

.text-danger {
    color: #bd2130 !important;
    font-weight: 500;
}

// Ajustes del formulario reactivo inferior
form {
    margin-top: 15px;

    mat-form-field {
        width: 100%;

        // Reduce un poco el espaciado interno por defecto de Material para que sea más compacto
        ::vmax-deep .mat-mdc-form-field-subscript-wrapper {
            display: none; // Oculta el espacio de error para que no salte el diseño al validar
        }
    }

    // Centrado vertical del botón "+" respecto a los inputs
    button[type="submit"] {
        margin-bottom: 4px;
        background-color: #0d6efd;
        color: #fff;

        &[disabled] {
            background-color: rgba(0, 0, 0, 0.12);
            color: rgba(0, 0, 0, 0.26);
        }
    }
}

// Espaciado del contenedor general del diálogo
mat-dialog-content {
    padding-top: 8px !important;
    padding-bottom: 16px !important;
}

/* 👈 Posicionamiento del título y el botón de cierre */
.dialog-title {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-right: 8px;
    margin: 0;
}

.close-btn {
    color: rgba(0, 0, 0, 0.54);

    &:hover {
        color: rgba(0, 0, 0, 0.87);
        background-color: rgba(0, 0, 0, 0.04);
    }
}

/* 👈 Ocultar flechas del input type="number" (Chrome, Safari, Edge, Opera) */
input::-webkit-outer-spin-button,
input::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
}

/* 👈 Ocultar flechas en Firefox */
input[type='number'] {
    -moz-appearance: textfield;
}

.no-data {
    text-align: center;
    color: rgba(0, 0, 0, 0.6);
    font-style: italic;
    padding: 16px 0;
}

.gasto-form {
    display: flex;
    gap: 12px;
    align-items: baseline;
    margin-bottom: 16px;
}
```

File: albergo/src/app/principal/caja/arqueo/modal-gastos/modal-gastos.componet.ts

```typescript
import { Component, inject, OnInit } from '@angular/core';
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
    standalone: true,
    imports: [
        CommonModule,
        MatDialogModule,
        ReactiveFormsModule,
        MatFormFieldModule,
        MatInputModule,
        MatButtonModule,
        MatIconModule,
        MatTableModule
    ],
    templateUrl: './modal-gastos.component.html',
    styleUrl: './modal-gastos.component.scss'
})
export class ModalGastosComponent implements OnInit {
    dialogRef = inject(MatDialogRef<ModalGastosComponent>);
    data = inject<{ caja: Caja | null }>(MAT_DIALOG_DATA);
    #fb = inject(FormBuilder);

    cajaClonada!: Caja;

    // Inicialización inmediata del formulario (solución del error anterior)
    gastoForm: FormGroup = this.#fb.group({
        descripcion: ['', [Validators.required]],
        monto: [null, [Validators.required]]
    });

    columnasTabla: string[] = ['descripcion', 'monto'];
    dataSource = new MatTableDataSource<any>([]);

    ngOnInit(): void {
        // ✅ FALLBACK ROBUSTO: Si data.caja es null o undefined, usamos un objeto vacío
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

        // ✅ Doble verificación de seguridad por si acaso
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
```

File: albergo/src/app/principal/caja/arqueo/monto-arqueo/monto-arqueo.component.html

```html
<mat-card class="daxa-card total-orders-card mb-25 border-radius bg-primary border-none d-block">
    <mat-card-content>
        <div class="d-flex justify-content-between">
            <div class="title">
                <h5>Monto Rendido</h5>

                @if (editando()) {
                <div class="number fw-medium lh-1 d-inline-flex align-items-center">
                    <i class="material-symbols-outlined me-1" style="font-size: 1em;">attach_money</i>
                    <input class="monto-input fw-medium lh-1" type="text" inputmode="decimal" [value]="total()"
                        (blur)="desactivarEdicion($any($event.target).value)"
                        (keydown.enter)="$any($event.target).blur()" #inputMonto />
                </div>
                } @else {
                <div class="number fw-medium lh-1 d-inline-flex align-items-start" (click)="activarEdicion()"
                    title="Click para editar" style="cursor: pointer;">
                    <span>$ {{ getEnteros() }}</span>
                    <sup class="fw-medium ms-1" style="font-size: 0.6em; top: 0;">,{{ getDecimales() }}</sup>
                </div>
                }
                <div class="text-white-50 d-block fs-7 mt-1">
                    <span>Diferencia: $ {{ diferencia() | number:'1.2-2' }}</span>
                </div>
            </div>

            <div class="icon text-center bg-daxa rounded-circle text-white position-relative">
                <i class="material-symbols-outlined">price_check</i>
            </div>
        </div>
        <div class="info d-flex align-items-center justify-content-between">
            <span class="sub-title d-block text-body">
                Click en el Monto para Editar
            </span>
        </div>
    </mat-card-content>
</mat-card>
```

File: albergo/src/app/principal/caja/arqueo/monto-arqueo/monto-arqueo.component.scss

```text
.mat-mdc-card {
    &.daxa-card {
        &.total-orders-card {
            .mat-mdc-card-content {
                .title {
                    h5 {
                        margin-bottom: 10px;
                    }

                    .number {
                        font-size: 26px;

                        // 👇 Estilos para el span clickeable (modo visualización)
                        span[title="Click para editar"] {
                            cursor: pointer;
                            transition: color 0.15s ease;

                            &:hover {
                                color: #1976d2;
                            }
                        }

                        // 👇 Estilos para el icono $ delante del input
                        i.material-symbols-outlined {
                            font-size: 26px;
                            color: #1976d2;
                            transform: none;
                            position: static;
                            margin-top: 0;
                            top: auto;
                            right: auto;
                            left: auto;
                        }

                        // 👇 Estilos para el input de edición
                        .monto-input {
                            font-family: inherit;
                            font-size: inherit;
                            font-weight: inherit;
                            line-height: inherit;
                            color: inherit;
                            border: none;
                            border-bottom: 2px solid #1976d2;
                            background: transparent;
                            outline: none;
                            padding: 2px 4px;
                            width: 140px;
                            transition: border-color 0.2s ease;

                            &:focus {
                                border-bottom-color: #0d47a1;
                            }
                        }
                    }
                }

                .icon {
                    width: 75px;
                    height: 75px;

                    i {
                        transform: translateY(-50%);
                        position: absolute;
                        margin-top: -1px;
                        font-size: 40px;
                        top: 50%;
                        right: 0;
                        left: 0;
                    }
                }

                .info {
                    margin-top: 23px;

                    .sub-title {
                        font-size: 14px;
                    }
                }
            }
        }
    }
}

/* Max width 767px */
@media only screen and (max-width : 767px) {

    .mat-mdc-card {
        &.daxa-card {
            &.total-orders-card {
                .mat-mdc-card-content {
                    .title {
                        .number {
                            font-size: 22px;

                            // 👇 Ajuste responsive para el icono $
                            i.material-symbols-outlined {
                                font-size: 22px;
                            }

                            // 👇 Ajuste responsive para el input
                            .monto-input {
                                width: 110px;
                            }
                        }
                    }

                    .icon {
                        width: 65px;
                        height: 65px;

                        i {
                            font-size: 35px;
                        }
                    }

                    .info {
                        margin-top: 15px;
                    }
                }
            }
        }
    }

}

/* Min width 576px to Max width 767px */
@media only screen and (min-width : 576px) and (max-width : 767px) {}

/* Min width 768px to Max width 991px */
@media only screen and (min-width : 768px) and (max-width : 991px) {}

/* Min width 992px to Max width 1199px */
@media only screen and (min-width : 992px) and (max-width : 1199px) {}

/* Min width 1200px to Max width 1399px */
@media only screen and (min-width: 1200px) and (max-width: 1399px) {}

/* Min width 1600px */
@media only screen and (min-width: 1600px) {}
```

File: albergo/src/app/principal/caja/arqueo/monto-arqueo/monto-arqueo.component.ts

```typescript
import { Component, ElementRef, HostListener, model, signal, viewChild, afterRender, input } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { FormsModule } from '@angular/forms';
import { MatIcon } from '@angular/material/icon';
import { Caja } from '@base/src/app/DBase/Modelos/caja.model';

import { DatePipe, DecimalPipe } from '@angular/common';

@Component({
    selector: 'app-monto-arqueo',
    imports: [MatCardModule, FormsModule, MatIcon, DatePipe, DecimalPipe],
    templateUrl: './monto-arqueo.component.html',
    styleUrl: './monto-arqueo.component.scss'
})
export class MontoArqueoComponent {
    cajaData = input<Caja | null>(null);

    total = model<number>(0);
    editando = signal<boolean>(false);

    inputMonto = viewChild<HTMLInputElement>('inputMonto');

    diferencia = signal<number>(0);


    constructor(private el: ElementRef) {
        afterRender(() => {
            if (this.editando()) {
                const input = this.inputMonto();
                if (input) {
                    input.focus();
                    input.select();
                }
            }

            // Calculo de diferencia
            this.diferencia.set(
                (this.total() || 0) -
                (this.cajaData()?.totales.efectivo || 0) -
                (this.cajaData()?.montoInicial || 0) -
                (this.cajaData()?.gastos.reduce((acc, gasto) => acc + gasto.monto, 0) || 0) // gastos
            );
        });
    }

    activarEdicion(): void {
        this.editando.set(true);
    }

    desactivarEdicion(valorStr: string): void {
        // Si ya no estamos editando, no hacemos nada (evita doble guardado)
        if (!this.editando()) return;

        const limpio = valorStr.replace(/\./g, '').replace(',', '.');
        const numero = parseFloat(limpio) || 0;
        this.total.set(numero);
        this.editando.set(false);
    }

    // 👇 Click en cualquier parte del documento: si es fuera del componente, guardamos
    @HostListener('document:click', ['$event'])
    onClickOutside(event: MouseEvent): void {
        if (this.editando() && !this.el.nativeElement.contains(event.target as Node)) {
            const input = this.inputMonto();
            if (input) {
                this.desactivarEdicion(input.value);
            }
        }
    }

    getEnteros(): string {
        return Math.floor(this.total()).toLocaleString('es-AR');
    }

    getDecimales(): string {
        return (this.total() % 1).toFixed(2).slice(2);
    }
}
```

File: albergo/src/app/principal/caja/arqueo/monto-inicial/monto-inicial.component.html

```html
<mat-card class="daxa-card total-orders-card mb-25 border-radius bg-success border-none d-block">
    <mat-card-content>
        <div class="d-flex justify-content-between">
            <div class="title">
                <h5>Saldo Inicial</h5>

                @if (editando()) {
                <div class="number fw-medium lh-1 d-inline-flex align-items-center">
                    <i class="material-symbols-outlined me-1" style="font-size: 1em;">attach_money</i>
                    <input class="monto-input fw-medium lh-1" type="text" inputmode="decimal" [value]="total()"
                        (blur)="desactivarEdicion($any($event.target).value)"
                        (keydown.enter)="$any($event.target).blur()" #inputMonto />
                </div>
                } @else {
                <!-- ✅ El cursor y el título dependen de puedeEditar() -->
                <div class="number fw-medium lh-1 d-inline-flex align-items-start" (click)="activarEdicion()"
                    [title]="puedeEditar() ? 'Click para editar' : ''"
                    [style.cursor]="puedeEditar() ? 'pointer' : 'not-allowed'" role="button" tabindex="0">
                    <span>$ {{ getEnteros() }}</span>
                    <sup class="fw-medium ms-1" style="font-size: 0.6em; top: 0;">,{{ getDecimales() }}</sup>
                </div>
                }
            </div>

            <div class="icon text-center bg-daxa rounded-circle text-white position-relative">
                <i class="material-symbols-outlined">money_range</i>
            </div>
        </div>

        <div class="info d-flex align-items-center justify-content-between">
            <!-- ✅ El texto de instrucción solo aparece si puede editar -->
            @if (puedeEditar()) {
            <span class="sub-title d-block text-body">
                Click en el Monto para Editar
            </span>
            } <!--  @else {
            <span class="sub-title d-block text-body text-muted">
                Monto no editable
            </span>
            } -->
        </div>
    </mat-card-content>
</mat-card>
```

File: albergo/src/app/principal/caja/arqueo/monto-inicial/monto-inicial.component.scss

```text
.mat-mdc-card {
    &.daxa-card {
        &.total-orders-card {
            .mat-mdc-card-content {
                .title {
                    h5 {
                        margin-bottom: 10px;
                    }

                    .number {
                        font-size: 26px;

                        // 👇 Estilos para el span clickeable (modo visualización)
                        span[title="Click para editar"] {
                            cursor: pointer;
                            transition: color 0.15s ease;

                            &:hover {
                                color: #1976d2;
                            }
                        }

                        // 👇 Estilos para el icono $ delante del input
                        i.material-symbols-outlined {
                            font-size: 26px;
                            color: #1976d2;
                            transform: none;
                            position: static;
                            margin-top: 0;
                            top: auto;
                            right: auto;
                            left: auto;
                        }

                        // 👇 Estilos para el input de edición
                        .monto-input {
                            font-family: inherit;
                            font-size: inherit;
                            font-weight: inherit;
                            line-height: inherit;
                            color: inherit;
                            border: none;
                            border-bottom: 2px solid #1976d2;
                            background: transparent;
                            outline: none;
                            padding: 2px 4px;
                            width: 140px;
                            transition: border-color 0.2s ease;

                            &:focus {
                                border-bottom-color: #0d47a1;
                            }
                        }
                    }
                }

                .icon {
                    width: 75px;
                    height: 75px;

                    i {
                        transform: translateY(-50%);
                        position: absolute;
                        margin-top: -1px;
                        font-size: 40px;
                        top: 50%;
                        right: 0;
                        left: 0;
                    }
                }

                .info {
                    margin-top: 23px;

                    .sub-title {
                        font-size: 14px;
                    }
                }
            }
        }
    }
}

/* Max width 767px */
@media only screen and (max-width : 767px) {

    .mat-mdc-card {
        &.daxa-card {
            &.total-orders-card {
                .mat-mdc-card-content {
                    .title {
                        .number {
                            font-size: 22px;

                            // 👇 Ajuste responsive para el icono $
                            i.material-symbols-outlined {
                                font-size: 22px;
                            }

                            // 👇 Ajuste responsive para el input
                            .monto-input {
                                width: 110px;
                            }
                        }
                    }

                    .icon {
                        width: 65px;
                        height: 65px;

                        i {
                            font-size: 35px;
                        }
                    }

                    .info {
                        margin-top: 15px;
                    }
                }
            }
        }
    }

}

/* Min width 576px to Max width 767px */
@media only screen and (min-width : 576px) and (max-width : 767px) {}

/* Min width 768px to Max width 991px */
@media only screen and (min-width : 768px) and (max-width : 991px) {}

/* Min width 992px to Max width 1199px */
@media only screen and (min-width : 992px) and (max-width : 1199px) {}

/* Min width 1200px to Max width 1399px */
@media only screen and (min-width: 1200px) and (max-width: 1399px) {}

/* Min width 1600px */
@media only screen and (min-width: 1600px) {}
```

File: albergo/src/app/principal/caja/arqueo/monto-inicial/monto-inicial.component.ts

```typescript
import { Component, ElementRef, HostListener, model, signal, viewChild, afterRender, input, computed } from '@angular/core'; // <-- Agregado 'computed'
import { MatCardModule } from '@angular/material/card';
import { FormsModule } from '@angular/forms';
import { MatIcon } from '@angular/material/icon';
import { Caja } from '@base/src/app/DBase/Modelos/caja.model';
import { DatePipe } from '@angular/common';

@Component({
    selector: 'app-monto-inicial',
    imports: [MatCardModule, FormsModule, MatIcon, DatePipe],
    templateUrl: './monto-inicial.component.html',
    styleUrl: './monto-inicial.component.scss'
})
export class MontoInicialComponent {
    cajaData = input<Caja | null>(null);
    total = model<number>(0);
    editando = signal<boolean>(false);

    inputMonto = viewChild<HTMLInputElement>('inputMonto');

    // ✅ Nueva señal computada para controlar la visibilidad del texto
    puedeEditar = computed(() => {
        // Regla 3: Si el monto es mayor a cero, NUNCA se permite editar.
        if (this.total() !== 0) {
            return false;
        }

        const caja = this.cajaData();

        // Regla 1: Si cajaData es null (el padre envía null cuando id es 'todoCerrado'), SÍ permite editar.
        if (caja === null) {
            return true;
        }

        // Regla 4: Si la caja está abierta (cerrada === false), SÍ permite editar (porque ya validamos que el monto es 0).
        if (caja.cerrada === false) {
            return true;
        }

        // Regla 2: Si llega aquí, significa que cajaData NO es null y cerrada === true.
        // NO permite editar.
        return false;
    });

    constructor(private el: ElementRef) {
        afterRender(() => {
            if (this.editando()) {
                const input = this.inputMonto();
                if (input) {
                    input.focus();
                    input.select();
                }
            }
        });
    }

    activarEdicion(): void {
        // ✅ Solo permite editar si la señal computada lo autoriza
        if (this.puedeEditar()) {
            this.editando.set(true);
        } else {
            console.warn('No se permite editar el monto inicial en el estado actual de la caja.');
        }
    }

    desactivarEdicion(valorStr: string): void {
        if (!this.editando()) return;

        const limpio = valorStr.replace(/\./g, '').replace(',', '.');
        let numero = parseFloat(limpio) || 0;

        // ✅ No se permiten montos negativos. Si es negativo, lo forzamos a 0.
        if (numero < 0) {
            numero = 0;
            console.warn('No se permiten montos negativos. Se estableció en 0.');
        }


        this.total.set(numero);
        this.editando.set(false);
    }

    @HostListener('document:click', ['$event'])
    onClickOutside(event: MouseEvent): void {
        if (this.editando() && !this.el.nativeElement.contains(event.target as Node)) {
            const input = this.inputMonto();
            if (input) {
                this.desactivarEdicion(input.value);
            }
        }
    }

    getEnteros(): string {
        return Math.floor(this.total()).toLocaleString('es-AR');
    }

    getDecimales(): string {
        return (this.total() % 1).toFixed(2).slice(2);
    }
}
```

File: albergo/src/app/principal/caja/arqueo/total-billetera/total-billetera.component.html

```html
<mat-card class="daxa-card total-orders-card mb-25 border-radius bg-white border-none d-block">
    <mat-card-content>
        <div class="d-flex justify-content-between">
            <div class="title">
                <h5>
                    Ventas en Billeteras Virtuales
                </h5>
                <div class="number fw-medium lh-1 d-inline-flex align-items-start">
                    <span>$ {{ getEnteros() }}</span>
                    <sup class="fw-medium ms-1" style="font-size: 0.6em; top: 0;">,{{ getDecimales() }}</sup>
                </div>
            </div>
            <div class="icon text-center bg-daxa rounded-circle text-white position-relative">
                <i class="material-symbols-outlined">
                    account_balance_wallet
                </i>
            </div>
        </div>
    </mat-card-content>
</mat-card>
```

File: albergo/src/app/principal/caja/arqueo/total-billetera/total-billetera.component.scss

```text
.mat-mdc-card {
    &.daxa-card {
        &.total-orders-card {
            .mat-mdc-card-content {
                .title {
                    h5 {
                        margin-bottom: 10px;
                    }
                    .number {
                        font-size: 26px;
                    }
                }
                .icon {
                    width: 75px;
                    height: 75px;

                    i {
                        transform: translateY(-50%);
                        position: absolute;
                        margin-top: -1px;
                        font-size: 40px;
                        top: 50%;
                        right: 0;
                        left: 0;
                    }
                }
                .info {
                    margin-top: 23px;

                    .sub-title {
                        font-size: 14px;
                    }
                }
            }
        }
    }
}

/* Max width 767px */
@media only screen and (max-width : 767px) {

    .mat-mdc-card {
        &.daxa-card {
            &.total-orders-card {
                .mat-mdc-card-content {
                    .title {
                        .number {
                            font-size: 22px;
                        }
                    }
                    .icon {
                        width: 65px;
                        height: 65px;
    
                        i {
                            font-size: 35px;
                        }
                    }
                    .info {
                        margin-top: 15px;
                    }
                }
            }
        }
    }

}

/* Min width 576px to Max width 767px */
@media only screen and (min-width : 576px) and (max-width : 767px) {}

/* Min width 768px to Max width 991px */
@media only screen and (min-width : 768px) and (max-width : 991px) {}

/* Min width 992px to Max width 1199px */
@media only screen and (min-width : 992px) and (max-width : 1199px) {}

/* Min width 1200px to Max width 1399px */
@media only screen and (min-width: 1200px) and (max-width: 1399px) {}

/* Min width 1600px */
@media only screen and (min-width: 1600px) {}
```

File: albergo/src/app/principal/caja/arqueo/total-billetera/total-billetera.component.ts

```typescript
import { Component, input } from '@angular/core';
import { MatCardModule } from '@angular/material/card';

@Component({
    selector: 'app-total-billetera',
    imports: [MatCardModule],
    templateUrl: './total-billetera.component.html',
    styleUrl: './total-billetera.component.scss'
})
export class TotalBilleteraComponent {
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
```

File: albergo/src/app/principal/caja/arqueo/total-cheque/total-cheque.component.html

```html
<mat-card class="daxa-card total-orders-card mb-25 border-radius bg-white border-none d-block">
    <mat-card-content>
        <div class="d-flex justify-content-between">
            <div class="title">
                <h5>
                    Ventas con Cheques
                </h5>
                <div class="number fw-medium lh-1 d-inline-flex align-items-start">
                    <span>$ {{ getEnteros() }}</span>
                    <sup class="fw-medium ms-1" style="font-size: 0.6em; top: 0;">,{{ getDecimales() }}</sup>
                </div>
            </div>
            <div class="icon text-center bg-daxa rounded-circle text-white position-relative">
                <i class="material-symbols-outlined">
                    description
                </i>
            </div>
        </div>
    </mat-card-content>
</mat-card>
```

File: albergo/src/app/principal/caja/arqueo/total-cheque/total-cheque.component.scss

```text
.mat-mdc-card {
    &.daxa-card {
        &.total-orders-card {
            .mat-mdc-card-content {
                .title {
                    h5 {
                        margin-bottom: 10px;
                    }
                    .number {
                        font-size: 26px;
                    }
                }
                .icon {
                    width: 75px;
                    height: 75px;

                    i {
                        transform: translateY(-50%);
                        position: absolute;
                        margin-top: -1px;
                        font-size: 40px;
                        top: 50%;
                        right: 0;
                        left: 0;
                    }
                }
                .info {
                    margin-top: 23px;

                    .sub-title {
                        font-size: 14px;
                    }
                }
            }
        }
    }
}

/* Max width 767px */
@media only screen and (max-width : 767px) {

    .mat-mdc-card {
        &.daxa-card {
            &.total-orders-card {
                .mat-mdc-card-content {
                    .title {
                        .number {
                            font-size: 22px;
                        }
                    }
                    .icon {
                        width: 65px;
                        height: 65px;
    
                        i {
                            font-size: 35px;
                        }
                    }
                    .info {
                        margin-top: 15px;
                    }
                }
            }
        }
    }

}

/* Min width 576px to Max width 767px */
@media only screen and (min-width : 576px) and (max-width : 767px) {}

/* Min width 768px to Max width 991px */
@media only screen and (min-width : 768px) and (max-width : 991px) {}

/* Min width 992px to Max width 1199px */
@media only screen and (min-width : 992px) and (max-width : 1199px) {}

/* Min width 1200px to Max width 1399px */
@media only screen and (min-width: 1200px) and (max-width: 1399px) {}

/* Min width 1600px */
@media only screen and (min-width: 1600px) {}
```

File: albergo/src/app/principal/caja/arqueo/total-cheque/total-cheque.component.ts

```typescript
import { Component, input } from '@angular/core';
import { MatCardModule } from '@angular/material/card';

@Component({
    selector: 'app-total-cheque',
    imports: [MatCardModule],
    templateUrl: './total-cheque.component.html',
    styleUrl: './total-cheque.component.scss'
})
export class TotalChequeComponent {
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
```

File: albergo/src/app/principal/caja/arqueo/total-credito/total-credito.component.html

```html
<mat-card class="daxa-card total-orders-card mb-25 border-radius bg-white border-none d-block">
    <mat-card-content>
        <div class="d-flex justify-content-between">
            <div class="title">
                <h5>
                    Ventas en Tarjetas de Crédito
                </h5>
                <div class="number fw-medium lh-1 d-inline-flex align-items-start">
                    <span>$ {{ getEnteros() }}</span>
                    <sup class="fw-medium ms-1" style="font-size: 0.6em; top: 0;">,{{ getDecimales() }}</sup>
                </div>
            </div>
            <div class="icon text-center bg-daxa rounded-circle text-white position-relative">
                <i class="material-symbols-outlined">
                    credit_card
                </i>
            </div>
        </div>
    </mat-card-content>
</mat-card>
```

File: albergo/src/app/principal/caja/arqueo/total-credito/total-credito.component.scss

```text
.mat-mdc-card {
    &.daxa-card {
        &.total-orders-card {
            .mat-mdc-card-content {
                .title {
                    h5 {
                        margin-bottom: 10px;
                    }
                    .number {
                        font-size: 26px;
                    }
                }
                .icon {
                    width: 75px;
                    height: 75px;

                    i {
                        transform: translateY(-50%);
                        position: absolute;
                        margin-top: -1px;
                        font-size: 40px;
                        top: 50%;
                        right: 0;
                        left: 0;
                    }
                }
                .info {
                    margin-top: 23px;

                    .sub-title {
                        font-size: 14px;
                    }
                }
            }
        }
    }
}

/* Max width 767px */
@media only screen and (max-width : 767px) {

    .mat-mdc-card {
        &.daxa-card {
            &.total-orders-card {
                .mat-mdc-card-content {
                    .title {
                        .number {
                            font-size: 22px;
                        }
                    }
                    .icon {
                        width: 65px;
                        height: 65px;
    
                        i {
                            font-size: 35px;
                        }
                    }
                    .info {
                        margin-top: 15px;
                    }
                }
            }
        }
    }

}

/* Min width 576px to Max width 767px */
@media only screen and (min-width : 576px) and (max-width : 767px) {}

/* Min width 768px to Max width 991px */
@media only screen and (min-width : 768px) and (max-width : 991px) {}

/* Min width 992px to Max width 1199px */
@media only screen and (min-width : 992px) and (max-width : 1199px) {}

/* Min width 1200px to Max width 1399px */
@media only screen and (min-width: 1200px) and (max-width: 1399px) {}

/* Min width 1600px */
@media only screen and (min-width: 1600px) {}
```

File: albergo/src/app/principal/caja/arqueo/total-credito/total-credito.component.ts

```typescript
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
```

File: albergo/src/app/principal/caja/arqueo/total-ctacte/total-ctacte.component.html

```html
<mat-card class="daxa-card total-orders-card mb-25 border-radius bg-white border-none d-block">
    <mat-card-content>
        <div class="d-flex justify-content-between">
            <div class="title">
                <h5>
                    Ventas en Cuentas Corrientes
                </h5>
                <div class="number fw-medium lh-1 d-inline-flex align-items-start">
                    <span>$ {{ getEnteros() }}</span>
                    <sup class="fw-medium ms-1" style="font-size: 0.6em; top: 0;">,{{ getDecimales() }}</sup>
                </div>

            </div>
            <div class="icon text-center bg-daxa rounded-circle text-white position-relative">
                <i class="material-symbols-outlined">
                    receipt_long
                </i>
            </div>
        </div>
    </mat-card-content>
</mat-card>
```

File: albergo/src/app/principal/caja/arqueo/total-ctacte/total-ctacte.component.scss

```text
.mat-mdc-card {
    &.daxa-card {
        &.total-orders-card {
            .mat-mdc-card-content {
                .title {
                    h5 {
                        margin-bottom: 10px;
                    }
                    .number {
                        font-size: 26px;
                    }
                }
                .icon {
                    width: 75px;
                    height: 75px;

                    i {
                        transform: translateY(-50%);
                        position: absolute;
                        margin-top: -1px;
                        font-size: 40px;
                        top: 50%;
                        right: 0;
                        left: 0;
                    }
                }
                .info {
                    margin-top: 23px;

                    .sub-title {
                        font-size: 14px;
                    }
                }
            }
        }
    }
}

/* Max width 767px */
@media only screen and (max-width : 767px) {

    .mat-mdc-card {
        &.daxa-card {
            &.total-orders-card {
                .mat-mdc-card-content {
                    .title {
                        .number {
                            font-size: 22px;
                        }
                    }
                    .icon {
                        width: 65px;
                        height: 65px;
    
                        i {
                            font-size: 35px;
                        }
                    }
                    .info {
                        margin-top: 15px;
                    }
                }
            }
        }
    }

}

/* Min width 576px to Max width 767px */
@media only screen and (min-width : 576px) and (max-width : 767px) {}

/* Min width 768px to Max width 991px */
@media only screen and (min-width : 768px) and (max-width : 991px) {}

/* Min width 992px to Max width 1199px */
@media only screen and (min-width : 992px) and (max-width : 1199px) {}

/* Min width 1200px to Max width 1399px */
@media only screen and (min-width: 1200px) and (max-width: 1399px) {}

/* Min width 1600px */
@media only screen and (min-width: 1600px) {}
```

File: albergo/src/app/principal/caja/arqueo/total-ctacte/total-ctacte.component.ts

```typescript
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
```

File: albergo/src/app/principal/caja/arqueo/total-debito/total-debito.component.html

```html
<mat-card class="daxa-card total-orders-card mb-25 border-radius bg-white border-none d-block">
    <mat-card-content>
        <div class="d-flex justify-content-between">
            <div class="title">
                <h5>
                    Ventas en Tarjetas de Débito
                </h5>
                <div class="number fw-medium lh-1 d-inline-flex align-items-start">
                    <span>$ {{ getEnteros() }}</span>
                    <sup class="fw-medium ms-1" style="font-size: 0.6em; top: 0;">,{{ getDecimales() }}</sup>
                </div>
            </div>
            <div class="icon text-center bg-daxa rounded-circle text-white position-relative">
                <i class="material-symbols-outlined">
                    credit_card
                </i>
            </div>
        </div>
    </mat-card-content>
</mat-card>
```

File: albergo/src/app/principal/caja/arqueo/total-debito/total-debito.component.scss

```text
.mat-mdc-card {
    &.daxa-card {
        &.total-orders-card {
            .mat-mdc-card-content {
                .title {
                    h5 {
                        margin-bottom: 10px;
                    }
                    .number {
                        font-size: 26px;
                    }
                }
                .icon {
                    width: 75px;
                    height: 75px;

                    i {
                        transform: translateY(-50%);
                        position: absolute;
                        margin-top: -1px;
                        font-size: 40px;
                        top: 50%;
                        right: 0;
                        left: 0;
                    }
                }
                .info {
                    margin-top: 23px;

                    .sub-title {
                        font-size: 14px;
                    }
                }
            }
        }
    }
}

/* Max width 767px */
@media only screen and (max-width : 767px) {

    .mat-mdc-card {
        &.daxa-card {
            &.total-orders-card {
                .mat-mdc-card-content {
                    .title {
                        .number {
                            font-size: 22px;
                        }
                    }
                    .icon {
                        width: 65px;
                        height: 65px;
    
                        i {
                            font-size: 35px;
                        }
                    }
                    .info {
                        margin-top: 15px;
                    }
                }
            }
        }
    }

}

/* Min width 576px to Max width 767px */
@media only screen and (min-width : 576px) and (max-width : 767px) {}

/* Min width 768px to Max width 991px */
@media only screen and (min-width : 768px) and (max-width : 991px) {}

/* Min width 992px to Max width 1199px */
@media only screen and (min-width : 992px) and (max-width : 1199px) {}

/* Min width 1200px to Max width 1399px */
@media only screen and (min-width: 1200px) and (max-width: 1399px) {}

/* Min width 1600px */
@media only screen and (min-width: 1600px) {}
```

File: albergo/src/app/principal/caja/arqueo/total-debito/total-debito.component.ts

```typescript
import { Component, input } from '@angular/core';
import { MatCardModule } from '@angular/material/card';

@Component({
    selector: 'app-total-debito',
    imports: [MatCardModule],
    templateUrl: './total-debito.component.html',
    styleUrl: './total-debito.component.scss'
})
export class TotalDebitoComponent {
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
```

File: albergo/src/app/principal/caja/arqueo/total-efectivo/total-efectivo.component.html

```html
<mat-card class="daxa-card total-orders-card mb-25 border-radius bg-white border-none d-block">
    <mat-card-content>
        <div class="d-flex justify-content-between">
            <div class="title">
                <h5>
                    Ventas en Efectivo
                </h5>
                <div class="number fw-medium lh-1 d-inline-flex align-items-start">
                    <span>$ {{ getEnteros() }}</span>
                    <sup class="fw-medium ms-1" style="font-size: 0.6em; top: 0;">,{{ getDecimales() }}</sup>
                </div>

            </div>
            <div class="icon text-center bg-daxa rounded-circle text-white position-relative">
                <i class="material-symbols-outlined">
                    payments
                </i>
            </div>
        </div>
    </mat-card-content>
</mat-card>
```

File: albergo/src/app/principal/caja/arqueo/total-efectivo/total-efectivo.component.scss

```text
.mat-mdc-card {
    &.daxa-card {
        &.total-orders-card {
            .mat-mdc-card-content {
                .title {
                    h5 {
                        margin-bottom: 10px;
                    }
                    .number {
                        font-size: 26px;
                    }
                }
                .icon {
                    width: 75px;
                    height: 75px;

                    i {
                        transform: translateY(-50%);
                        position: absolute;
                        margin-top: -1px;
                        font-size: 40px;
                        top: 50%;
                        right: 0;
                        left: 0;
                    }
                }
                .info {
                    margin-top: 23px;

                    .sub-title {
                        font-size: 14px;
                    }
                }
            }
        }
    }
}

/* Max width 767px */
@media only screen and (max-width : 767px) {

    .mat-mdc-card {
        &.daxa-card {
            &.total-orders-card {
                .mat-mdc-card-content {
                    .title {
                        .number {
                            font-size: 22px;
                        }
                    }
                    .icon {
                        width: 65px;
                        height: 65px;
    
                        i {
                            font-size: 35px;
                        }
                    }
                    .info {
                        margin-top: 15px;
                    }
                }
            }
        }
    }

}

/* Min width 576px to Max width 767px */
@media only screen and (min-width : 576px) and (max-width : 767px) {}

/* Min width 768px to Max width 991px */
@media only screen and (min-width : 768px) and (max-width : 991px) {}

/* Min width 992px to Max width 1199px */
@media only screen and (min-width : 992px) and (max-width : 1199px) {}

/* Min width 1200px to Max width 1399px */
@media only screen and (min-width: 1200px) and (max-width: 1399px) {}

/* Min width 1600px */
@media only screen and (min-width: 1600px) {}
```

File: albergo/src/app/principal/caja/arqueo/total-efectivo/total-efectivo.component.ts

```typescript
import { Component, input } from '@angular/core';
import { MatCardModule } from '@angular/material/card';

@Component({
    selector: 'app-total-efectivo',
    imports: [MatCardModule],
    templateUrl: './total-efectivo.component.html',
    styleUrl: './total-efectivo.component.scss'
})
export class TotalEfectivoComponent {
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
```

File: albergo/src/app/principal/caja/arqueo/total-gasto/total-gasto.component.html

```html
<mat-card class="daxa-card total-orders-card mb-25 border-radius border-none d-block bg-info"
    (click)="abrirModalGastos()" [style.cursor]="caja()?.cerrada ? 'not-allowed' : 'pointer'" role="button"
    tabindex="0">

    <mat-card-content>
        <div class="d-flex justify-content-between">
            <div class="title">
                <h5>Total Gastos / Ingreso</h5>
                <div class="number fw-medium lh-1 d-inline-flex align-items-start">
                    <span>$ {{ getEnteros() }}</span>
                    <sup class="fw-medium ms-1" style="font-size: 0.6em; top: 0;">,{{ getDecimales() }}</sup>
                </div>
            </div>
            <div class="icon text-center bg-daxa rounded-circle text-white position-relative">
                <i class="material-symbols-outlined">attach_money</i>
            </div>
        </div>
        <div class="info d-flex align-items-center justify-content-between">
            <span class="sub-title d-block text-body text-center">
                <!-- Cambia el texto si está cerrada -->
                {{ caja()?.cerrada ? '' : 'Click para Editar' }}
            </span>
        </div>
    </mat-card-content>
</mat-card>
```

File: albergo/src/app/principal/caja/arqueo/total-gasto/total-gasto.component.scss

```text
.mat-mdc-card {
    &.daxa-card {
        &.total-orders-card {
            .mat-mdc-card-content {
                .title {
                    h5 {
                        margin-bottom: 10px;
                    }
                    .number {
                        font-size: 26px;
                    }
                }
                .icon {
                    width: 75px;
                    height: 75px;

                    i {
                        transform: translateY(-50%);
                        position: absolute;
                        margin-top: -1px;
                        font-size: 40px;
                        top: 50%;
                        right: 0;
                        left: 0;
                    }
                }
                .info {
                    margin-top: 23px;

                    .sub-title {
                        font-size: 14px;
                    }
                }
            }
        }
    }
}

/* Max width 767px */
@media only screen and (max-width : 767px) {

    .mat-mdc-card {
        &.daxa-card {
            &.total-orders-card {
                .mat-mdc-card-content {
                    .title {
                        .number {
                            font-size: 22px;
                        }
                    }
                    .icon {
                        width: 65px;
                        height: 65px;
    
                        i {
                            font-size: 35px;
                        }
                    }
                    .info {
                        margin-top: 15px;
                    }
                }
            }
        }
    }

}

/* Min width 576px to Max width 767px */
@media only screen and (min-width : 576px) and (max-width : 767px) {}

/* Min width 768px to Max width 991px */
@media only screen and (min-width : 768px) and (max-width : 991px) {}

/* Min width 992px to Max width 1199px */
@media only screen and (min-width : 992px) and (max-width : 1199px) {}

/* Min width 1200px to Max width 1399px */
@media only screen and (min-width: 1200px) and (max-width: 1399px) {}

/* Min width 1600px */
@media only screen and (min-width: 1600px) {}
```

File: albergo/src/app/principal/caja/arqueo/total-gasto/total-gasto.component.ts

```typescript
import { Component, input, output, inject } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatDialog } from '@angular/material/dialog';
import { Caja } from '@dbTabla/caja.model';
import { ModalGastosComponent } from '../modal-gastos/modal-gastos.componet'; // Creamos este modal abajo

@Component({
    selector: 'app-total-gasto',
    imports: [MatCardModule],
    templateUrl: './total-gasto.component.html',
    styleUrl: './total-gasto.component.scss'
})
export class TotalGastoComponent {
    total = input<number>(0); // Solo lectura
    caja = input<Caja | null>(null); // Recibimos la caja para enviarla al modal
    cajaModificada = output<Caja>(); // Notifica al padre los cambios realizados

    #dialog = inject(MatDialog);

    abrirModalGastos() {
        // Regla 1: Si cajaData es null (el padre envía null cuando id es 'todoCerrado'), SÍ permite editar.
        //if (caja === null) {

        if (this.caja()?.cerrada) return;

        const dialogRef = this.#dialog.open(ModalGastosComponent, {
            width: '500px',
            disableClose: true, // Obliga a usar el botón salir
            data: { caja: this.caja() }
        });

        dialogRef.afterClosed().subscribe((cajaActualizada: Caja | undefined) => {
            console.log('Modal cerrado. Caja actualizada:', cajaActualizada);
            if (cajaActualizada) {
                this.cajaModificada.emit(cajaActualizada);
            }
        });
    }

    // Corrección robusta para soportar números positivos y negativos
    getEnteros(): string {
        const valor = this.total();
        const parteEntera = valor >= 0 ? Math.floor(valor) : Math.ceil(valor);
        return parteEntera.toLocaleString('es-AR');
    }

    getDecimales(): string {
        const valor = Math.abs(this.total());
        return (valor % 1).toFixed(2).slice(2);
    }
}
```

File: albergo/src/app/principal/caja/arqueo/total-transferencia/total-transferencia.component.html

```html
<mat-card class="daxa-card total-orders-card mb-25 border-radius bg-white border-none d-block">
    <mat-card-content>
        <div class="d-flex justify-content-between">
            <div class="title">
                <h5>
                    Ventas con Transferencias
                </h5>
                <div class="number fw-medium lh-1 d-inline-flex align-items-start">
                    <span>$ {{ getEnteros() }}</span>
                    <sup class="fw-medium ms-1" style="font-size: 0.6em; top: 0;">,{{ getDecimales() }}</sup>
                </div>
            </div>
            <div class="icon text-center bg-daxa rounded-circle text-white position-relative">
                <i class="material-symbols-outlined">
                    sync_alt
                </i>
            </div>
        </div>
    </mat-card-content>
</mat-card>
```

File: albergo/src/app/principal/caja/arqueo/total-transferencia/total-transferencia.component.scss

```text
.mat-mdc-card {
    &.daxa-card {
        &.total-orders-card {
            .mat-mdc-card-content {
                .title {
                    h5 {
                        margin-bottom: 10px;
                    }
                    .number {
                        font-size: 26px;
                    }
                }
                .icon {
                    width: 75px;
                    height: 75px;

                    i {
                        transform: translateY(-50%);
                        position: absolute;
                        margin-top: -1px;
                        font-size: 40px;
                        top: 50%;
                        right: 0;
                        left: 0;
                    }
                }
                .info {
                    margin-top: 23px;

                    .sub-title {
                        font-size: 14px;
                    }
                }
            }
        }
    }
}

/* Max width 767px */
@media only screen and (max-width : 767px) {

    .mat-mdc-card {
        &.daxa-card {
            &.total-orders-card {
                .mat-mdc-card-content {
                    .title {
                        .number {
                            font-size: 22px;
                        }
                    }
                    .icon {
                        width: 65px;
                        height: 65px;
    
                        i {
                            font-size: 35px;
                        }
                    }
                    .info {
                        margin-top: 15px;
                    }
                }
            }
        }
    }

}

/* Min width 576px to Max width 767px */
@media only screen and (min-width : 576px) and (max-width : 767px) {}

/* Min width 768px to Max width 991px */
@media only screen and (min-width : 768px) and (max-width : 991px) {}

/* Min width 992px to Max width 1199px */
@media only screen and (min-width : 992px) and (max-width : 1199px) {}

/* Min width 1200px to Max width 1399px */
@media only screen and (min-width: 1200px) and (max-width: 1399px) {}

/* Min width 1600px */
@media only screen and (min-width: 1600px) {}
```

File: albergo/src/app/principal/caja/arqueo/total-transferencia/total-transferencia.component.ts

```typescript
import { Component, input } from '@angular/core';
import { MatCardModule } from '@angular/material/card';

@Component({
    selector: 'app-total-transferencia',
    imports: [MatCardModule],
    templateUrl: './total-transferencia.component.html',
    styleUrl: './total-transferencia.component.scss'
})
export class TotalTransferenciaComponent {
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
```

File: albergo/src/app/principal/caja/arqueo/arqueo.component.html

```html
<div class="col-12">
    <!-- Breadcrumb -->
    <div class="breadcrumb-card mb-25 d-md-flex align-items-center justify-content-between">
        <h5 class="mb-0">
            Arqueo de Caja
        </h5>
        <ol class="breadcrumb list-unstyled mt-0 mb-0 pl-0">
            <li class="breadcrumb-item position-relative">
                <a routerLink="/" class="d-inline-block position-relative">
                    <i class="ri-home-8-line"></i>
                    Inicio
                </a>
            </li>
            <li class="breadcrumb-item position-relative">
                Cajas
            </li>
            <li class="breadcrumb-item position-relative">
                Arqueo
            </li>
        </ol>
    </div>

    <div class="row">
        <!-- 1: Total Efectivo -->
        <div class="col-sm-6 col-lg-3">
            <app-total-efectivo [total]="cajaData()?.totales?.efectivo || 0" />
        </div>

        <!-- 2: Total Debito -->
        <div class="col-sm-6 col-lg-3">
            <app-total-debito [total]="cajaData()?.totales?.debito || 0" />
        </div>

        <!-- 3: Total Tarjetas de Crédito -->
        <div class="col-sm-6 col-lg-3">
            <app-total-credito [total]="cajaData()?.totales?.credito || 0" />
        </div>

        <!-- 4: Total Billetera -->
        <div class="col-sm-6 col-lg-3">
            <app-total-billetera [total]="cajaData()?.totales?.billetera || 0" />
        </div>
    </div>
</div>

<div class="col-12">
    <div class="row">
        <!-- 5: Total Cta Cte -->
        <div class="col-sm-6 col-lg-3">
            <app-total-ctacte [total]="cajaData()?.totales?.ctacte || 0" />
        </div>

        <!-- 6: Total Transferencia -->
        <div class="col-sm-6 col-lg-3">
            <app-total-transferencia [total]="cajaData()?.totales?.transferencia || 0" />
        </div>

        <!-- 7: Total Cheque -->
        <div class="col-sm-6 col-lg-3">
            <app-total-cheque [total]="cajaData()?.totales?.cheque || 0" />
        </div>

        <!-- 8: Total Gastos -->
        <div class="col-sm-6 col-lg-3" tour="gessi-tutorial"
            tourText="Registra los gastos e ingresos de la caja. También permite realizar ajustes para corregir errores o movimientos no registrados."
            tourTitle="Gastos e ingresos" [tourPriority]="1">
            <app-total-gasto [caja]="cajaData()" [total]="totalGastos()" (cajaModificada)="actualizarGastos($event)" />
        </div>
    </div>
</div>

<div class="row">
    <div class="col-lg-12 col-xxxl-3">
        <div class="row">
            <div class="col-md-5 col-xxxl-12">

                <!-- Monto Inicial -->
                <app-monto-inicial [cajaData]="cajaData()" [total]="cajaData()?.montoInicial ?? 0"
                    (totalChange)="actualizarMontoInicial($event)" tour="gessi-tutorial"
                    tourText="Efectivo con el que se abre la caja. Si cometes un error al ingresarlo, puedes corregirlo desde la sección de Gastos e Ingresos."
                    tourTitle="Monto inicial" [tourPriority]="2">
                </app-monto-inicial>

            </div>
            <div class="col-md-7 col-xxxl-12">

                <!-- Monto Arqueo -->
                <app-monto-arqueo [cajaData]="cajaData()" [total]="cajaData()?.montoCierre ?? 0"
                    (totalChange)="actualizarMontoCierre($event)" tour="gessi-tutorial"
                    tourText="Cantidad de dinero en efectivo real que se entrega al finalizar y cerrar la caja."
                    tourTitle="Monto rendido" [tourPriority]="3">
                </app-monto-arqueo>
            </div>

        </div>
    </div>
    <button *ngIf="cajaData()?.cerrada === false" mat-flat-button class="d-block text-center w-100 btn-cerrar-caja"
        (click)="verificaCierre()">Cerrar Caja</button>
    <button *ngIf="cajaIdActual() === 'todoCerrado'" mat-flat-button class="d-block text-center w-100  btn-abrir-caja"
        (click)="abrirNuevaCaja()">Abrir Caja</button>
</div>
```

File: albergo/src/app/principal/caja/arqueo/arqueo.component.scss

```text
.btn-abrir-caja {
    background-color: #2d5016 !important;
    color: white !important;
    font-weight: bold !important;
    font-size: 1.25rem !important;
    margin-top: 2rem !important;
    margin-bottom: 3rem !important;
    padding: 1rem 2rem !important;

    &:hover {
        background-color: #1a3009 !important;
    }
}

.btn-cerrar-caja {
    background-color: #7a2029 !important;
    color: white !important;
    font-weight: bold !important;
    font-size: 1.25rem !important;
    margin-top: 2rem !important;
    margin-bottom: 3rem !important;
    padding: 1rem 2rem !important;

    &:hover {
        background-color: #30090c !important;
    }
}
```

File: albergo/src/app/principal/caja/arqueo/arqueo.component.ts

```typescript
import { Component, computed, inject, signal, Optional, Inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DipsUsuarioService } from '@serv/usuario/usuario.service';
import { NgxIndexedDBService } from 'ngx-indexed-db';
import { firstValueFrom } from 'rxjs';
import { Caja, Cajas } from '@dbTabla/caja.model';
import { MatDialogModule, MAT_DIALOG_DATA } from '@angular/material/dialog';

// Componentes de totales
import { TotalEfectivoComponent } from './total-efectivo/total-efectivo.component';
import { TotalDebitoComponent } from './total-debito/total-debito.component';
import { TotalCreditoComponent } from './total-credito/total-credito.component';
import { TotalBilleteraComponent } from './total-billetera/total-billetera.component';
import { TotalChequeComponent } from './total-cheque/total-cheque.component';
import { TotalTransferenciaComponent } from './total-transferencia/total-transferencia.component';
import { TotalCtacteComponent } from './total-ctacte/total-ctacte.component';
import { TotalGastoComponent } from './total-gasto/total-gasto.component';
import { MontoInicialComponent } from './monto-inicial/monto-inicial.component';
import { MontoArqueoComponent } from './monto-arqueo/monto-arqueo.component';

import { MatButtonModule } from '@angular/material/button';
import { NgIf } from '@angular/common';
import { IdGeneratorService } from '@serv/uid/id-generador.service';
import { CajaGestorService } from '../listado/service/gestor-caja.service';
import { DipsDialogoService } from '@serv/dialogo/dips-dialog.service'

// Tour
import { NgxWebTourModule } from '@abbasmgz/ngx-web-tour';

@Component({
    selector: 'app-arqueo',
    imports: [
        MatDialogModule, MatButtonModule, NgIf,
        TotalEfectivoComponent, TotalDebitoComponent, TotalCreditoComponent,
        TotalBilleteraComponent, TotalChequeComponent, TotalTransferenciaComponent,
        TotalCtacteComponent, TotalGastoComponent, MontoInicialComponent, MontoArqueoComponent,
        NgxWebTourModule
    ],
    templateUrl: './arqueo.component.html',
    styleUrls: ['./arqueo.component.scss']
})
export class ArqueoComponent implements OnInit {

    #route = inject(ActivatedRoute);
    #router = inject(Router);
    #dbService = inject(NgxIndexedDBService);
    #idGenerator = inject(IdGeneratorService);
    #cajaGestor = inject(CajaGestorService);

    cajaId?: string | null;
    cuentaDatos: any;
    puntoVenta: any;

    cajaIdActual = signal<string | null>(null);
    cajaData = signal<Caja | null>(null);

    totalGastos = computed(() => {
        const caja = this.cajaData();
        if (!caja || !caja.gastos || caja.gastos.length === 0) return 0;
        return caja.gastos.reduce((acumulado, gasto) => acumulado + (gasto.monto || 0), 0);
    });

    #dialogo = inject(DipsDialogoService)

    constructor(
        private _usuarioService: DipsUsuarioService,
        @Optional() @Inject(MAT_DIALOG_DATA) public dialogData?: any
    ) { }

    ngOnInit() {
        this.cajaId = this.#route.snapshot.params['id'];

        this._usuarioService.cuenta$.subscribe((cuenta) => {
            this.cuentaDatos = cuenta;
            if (cuenta) {
                this.puntoVenta = this._usuarioService.getPuntoVentaActual;
                const idAProcesar = this.cajaId ?? this.dialogData?.cajaId ?? null;
                this.procesarEstadoCaja(idAProcesar);
            }
        });
    }

    async procesarEstadoCaja(cajaIdEntrante?: string | null) {
        if (!cajaIdEntrante || cajaIdEntrante === "todoCerrado") {
            console.log('[Caja] Estado: Todo cerrado. Esperando acción del usuario para abrir.');
            this.cajaIdActual.set("todoCerrado");
            this.cajaData.set(null);
            return;
        }

        try {
            const cajaEncontrada = await firstValueFrom(
                this.#dbService.getByKey('caja', cajaIdEntrante)
            ) as Caja | undefined;

            if (cajaEncontrada) {
                this.cajaData.set({ ...cajaEncontrada });
                this.cajaIdActual.set(cajaEncontrada.id);
            } else {
                console.warn(`[Caja] No se encontró caja con ID: ${cajaIdEntrante}.`);
                this.cajaIdActual.set("todoCerrado");
                this.cajaData.set(null);
            }
        } catch (error) {
            console.error('[Caja] Error al cargar la caja:', error);
            this.cajaIdActual.set("todoCerrado");
            this.cajaData.set(null);
        }
    }

    async actualizarMontoInicial(nuevoMonto: number) {
        if (this.cajaIdActual() === 'todoCerrado' || !this.cajaIdActual()) {
            console.log(`[Caja] Abriendo caja con monto inicial de: ${nuevoMonto}`);
            await this.abrirNuevaCaja(nuevoMonto, false);
        } else {
            const caja = this.cajaData();
            if (caja) {
                this.cajaData.set({ ...caja, montoInicial: nuevoMonto });
                await this.guardarCambiosCaja();
            }
        }
    }

    /**
     * 🆕 NUEVO MÉTODO: Maneja actualizaciones de gastos desde el modal
     * Si la caja está cerrada, abre una nueva con los gastos. Si está abierta, actualiza.
     */
    async actualizarGastos(cajaConGastos: Caja) {
        if (this.cajaIdActual() === 'todoCerrado' || !this.cajaIdActual()) {
            // ✅ Si está cerrada, abrimos nueva caja con los gastos
            console.log('[Caja] Abriendo caja con gastos registrados desde modal');
            await this.abrirNuevaCajaConGastos(cajaConGastos);
        } else {
            // ✅ Si ya hay caja abierta, actualizamos los gastos
            this.cajaData.set({ ...cajaConGastos });
            await this.guardarCambiosCaja();
        }
    }

    /**
     * 🆕 NUEVO MÉTODO: Crea una nueva caja con los gastos del modal
     */
    async abrirNuevaCajaConGastos(cajaConGastos: Caja) {
        try {
            const puntoVentaActual = this._usuarioService.getPuntoVentaActual;
            if (!puntoVentaActual) {
                console.error('[Caja] No se puede abrir la caja: Punto de venta no asignado.');
                return;
            }

            const nuevaCaja = new Cajas();
            nuevaCaja.cerrada = false;
            nuevaCaja.puntoVenta = puntoVentaActual;
            nuevaCaja.fechaApertura = new Date();
            nuevaCaja.montoInicial = 0; // Monto inicial en 0, se puede ajustar después
            nuevaCaja.montoCierre = 0;
            nuevaCaja.gastos = cajaConGastos.gastos || []; // 👈 Usamos los gastos del modal
            nuevaCaja.datos = 0;
            nuevaCaja.totales = {
                movimientos: 0, efectivo: 0, debito: 0, credito: 0,
                billetera: 0, transferencia: 0, cheque: 0, ctacte: 0
            };
            nuevaCaja.usuario = this.cuentaDatos?.usuario || 'Desconocido';

            const idString = this.#idGenerator.generarId();
            nuevaCaja.id = idString;

            // Guardar en IndexedDB
            await firstValueFrom(this.#dbService.add('caja', nuevaCaja));

            // Notificar al gestor global
            this.#cajaGestor.notificarCambioEnCaja();

            // Actualizar estado reactivo local
            this.cajaData.set({ ...nuevaCaja });
            this.cajaIdActual.set(idString);

            console.log(`[Caja] Nueva caja creada con gastos. ID: ${idString}, Total gastos: ${this.totalGastos()}`);

        } catch (error) {
            console.error('[Caja] Error crítico al crear caja con gastos:', error);
        }
    }

    async abrirNuevaCaja(montoInicialForzado?: number, navegar: boolean = true) {
        try {
            console.log('[Caja] Iniciando creación de nueva caja...');

            const puntoVentaActual = this._usuarioService.getPuntoVentaActual;
            if (!puntoVentaActual) {
                console.error('[Caja] No se puede abrir la caja: Punto de venta no asignado.');
                return;
            }

            const nuevaCaja = new Cajas();
            nuevaCaja.cerrada = false;
            nuevaCaja.puntoVenta = puntoVentaActual;
            nuevaCaja.fechaApertura = new Date();
            nuevaCaja.montoInicial = montoInicialForzado ?? 0;
            nuevaCaja.montoCierre = 0;
            nuevaCaja.gastos = [];
            nuevaCaja.datos = 0;
            nuevaCaja.totales = {
                movimientos: 0, efectivo: 0, debito: 0, credito: 0,
                billetera: 0, transferencia: 0, cheque: 0, ctacte: 0
            };
            nuevaCaja.usuario = this.cuentaDatos?.usuario || 'Desconocido';

            const idString = this.#idGenerator.generarId();
            nuevaCaja.id = idString;

            await firstValueFrom(this.#dbService.add('caja', nuevaCaja));
            this.#cajaGestor.notificarCambioEnCaja();
            this.cajaData.set({ ...nuevaCaja });
            this.cajaIdActual.set(idString);

            console.log(`[Caja] Nueva caja creada y abierta exitosamente con ID: ${idString}`);

            if (navegar) {
                this.#router.navigate(['/caja/listado']);
            }

        } catch (error) {
            console.error('[Caja] Error crítico al crear la caja:', error);
        }
    }

    async guardarCambiosCaja() {
        const cajaActual = this.cajaData();
        if (cajaActual) {
            try {
                await firstValueFrom(this.#dbService.update('caja', cajaActual));
                this.#cajaGestor.notificarCambioEnCaja();
            } catch (error) {
                console.error('[Caja] Error al guardar cambios:', error);
            }
        }
    }

    actualizarCaja(nuevaCaja: Caja) {
        this.cajaData.set({ ...nuevaCaja });
        this.guardarCambiosCaja();
    }

    actualizarMontoCierre(nuevoMonto: number) {
        const caja = this.cajaData();
        if (caja) {
            this.cajaData.set({ ...caja, montoCierre: nuevoMonto });
            this.guardarCambiosCaja();
        }
    }

    async verificaCierre() {
        const diferencia = (this.cajaData()?.montoCierre || 0) -
            (this.cajaData()?.totales.efectivo || 0) -
            (this.cajaData()?.montoInicial || 0) -
            (this.cajaData()?.gastos.reduce((acc, gasto) => acc + gasto.monto, 0) || 0) // gastos

        console.log(`[Caja] Diferencia calculada: ${diferencia}`);

        if (diferencia !== 0) {
            this.#dialogo.confirm(
                `La diferencia entre el monto de cierre y los totales es de ${diferencia}.\n\n` +
                `¿Desea continuar con el cierre de la caja?`,
                {
                    titulo: 'Confirmar cierre de caja',
                    btnAceptar: 'Continuar',
                    btnCancela: 'Cancelar',
                    tipo: 'info'
                }
            ).subscribe(async (respuesta: boolean | undefined) => {
                if (respuesta === true) {
                    // Lógica para continuar con el cierre de la caja
                    this.cerrarCaja();
                }
            });
        } else {
            // Si no hay diferencia, cerramos la caja directamente
            this.cerrarCaja();
        }
    }

    async cerrarCaja() {
        const caja = this.cajaData();

        // Lógica para continuar con el cierre de la caja
        if (caja) {
            caja.cerrada = true;
            caja.fechaCierre = new Date();
            this.cajaData.set({ ...caja });
            await this.guardarCambiosCaja();
            this.#router.navigate(['/caja/listado']);
        }
    }

    salir() {
        console.log('[Caja] Saliendo de la vista de arqueo.');
    }
}



//////////////////////////////////////////////////////////////////////////
// import { Component, computed, inject, signal, Optional, Inject, OnInit } from '@angular/core';
// import { ActivatedRoute, Router } from '@angular/router';
// import { DipsUsuarioService } from '@serv/usuario/usuario.service';
// import { NgxIndexedDBService } from 'ngx-indexed-db';
// import { firstValueFrom } from 'rxjs';
// import { Caja, Cajas } from '@dbTabla/caja.model';
// import { MatDialogModule, MAT_DIALOG_DATA } from '@angular/material/dialog';

// // Componentes de totales
// import { TotalEfectivoComponent } from './total-efectivo/total-efectivo.component';
// import { TotalDebitoComponent } from './total-debito/total-debito.component';
// import { TotalCreditoComponent } from './total-credito/total-credito.component';
// import { TotalBilleteraComponent } from './total-billetera/total-billetera.component';
// import { TotalChequeComponent } from './total-cheque/total-cheque.component';
// import { TotalTransferenciaComponent } from './total-transferencia/total-transferencia.component';
// import { TotalCtacteComponent } from './total-ctacte/total-ctacte.component';
// import { TotalGastoComponent } from './total-gasto/total-gasto.component';
// import { MontoInicialComponent } from './monto-inicial/monto-inicial.component';
// import { MontoArqueoComponent } from './monto-arqueo/monto-arqueo.component';

// import { MatButtonModule } from '@angular/material/button';
// import { NgIf } from '@angular/common';
// import { IdGeneratorService } from '@serv/uid/id-generador.service';
// import { CajaGestorService } from '../listado/service/gestor-caja.service';

// @Component({
//     selector: 'app-arqueo',
//     imports: [
//         MatDialogModule, MatButtonModule, NgIf,
//         TotalEfectivoComponent, TotalDebitoComponent, TotalCreditoComponent,
//         TotalBilleteraComponent, TotalChequeComponent, TotalTransferenciaComponent,
//         TotalCtacteComponent, TotalGastoComponent, MontoInicialComponent, MontoArqueoComponent
//     ],
//     templateUrl: './arqueo.component.html',
//     styleUrls: ['./arqueo.component.scss']
// })
// export class ArqueoComponent implements OnInit {

//     #route = inject(ActivatedRoute);
//     #router = inject(Router);
//     #dbService = inject(NgxIndexedDBService);
//     #idGenerator = inject(IdGeneratorService);
//     #cajaGestor = inject(CajaGestorService);

//     cajaId?: string | null;
//     cuentaDatos: any;
//     puntoVenta: any;

//     cajaIdActual = signal<string | null>(null);
//     cajaData = signal<Caja | null>(null);

//     totalGastos = computed(() => {
//         const caja = this.cajaData();
//         if (!caja || !caja.gastos || caja.gastos.length === 0) return 0;
//         return caja.gastos.reduce((acumulado, gasto) => acumulado + (gasto.monto || 0), 0);
//     });

//     constructor(
//         private _usuarioService: DipsUsuarioService,
//         @Optional() @Inject(MAT_DIALOG_DATA) public dialogData?: any
//     ) { }

//     ngOnInit() {
//         this.cajaId = this.#route.snapshot.params['id'];

//         this._usuarioService.cuenta$.subscribe((cuenta) => {
//             this.cuentaDatos = cuenta;
//             if (cuenta) {
//                 this.puntoVenta = this._usuarioService.getPuntoVentaActual;
//                 const idAProcesar = this.cajaId ?? this.dialogData?.cajaId ?? null;
//                 this.procesarEstadoCaja(idAProcesar);
//             }
//         });
//     }

//     async procesarEstadoCaja(cajaIdEntrante?: string | null) {
//         if (!cajaIdEntrante || cajaIdEntrante === "todoCerrado") {
//             console.log('[Caja] Estado: Todo cerrado. Esperando acción del usuario para abrir.');
//             this.cajaIdActual.set("todoCerrado");
//             this.cajaData.set(null);
//             return;
//         }

//         try {
//             const cajaEncontrada = await firstValueFrom(
//                 this.#dbService.getByKey('caja', cajaIdEntrante)
//             ) as Caja | undefined;

//             if (cajaEncontrada) {
//                 this.cajaData.set({ ...cajaEncontrada });
//                 this.cajaIdActual.set(cajaEncontrada.id);
//             } else {
//                 console.warn(`[Caja] No se encontró caja con ID: ${cajaIdEntrante}.`);
//                 this.cajaIdActual.set("todoCerrado");
//                 this.cajaData.set(null);
//             }
//         } catch (error) {
//             console.error('[Caja] Error al cargar la caja:', error);
//             this.cajaIdActual.set("todoCerrado");
//             this.cajaData.set(null);
//         }
//     }

//     async actualizarMontoInicial(nuevoMonto: number) {
//         // ✅ Condición ampliada para asegurar que se detecte el estado cerrado
//         if (this.cajaIdActual() === 'todoCerrado' || !this.cajaIdActual()) {
//             console.log(`[Caja] Abriendo caja con monto inicial de: ${nuevoMonto}`);
//             await this.abrirNuevaCaja(nuevoMonto, false);
//         } else {
//             const caja = this.cajaData();
//             if (caja) {
//                 this.cajaData.set({ ...caja, montoInicial: nuevoMonto });
//                 await this.guardarCambiosCaja();
//             }
//         }
//     }

//     async abrirNuevaCaja(montoInicialForzado?: number, navegar: boolean = true) {
//         try {
//             console.log('[Caja] Iniciando creación de nueva caja...');

//             // 🎯 OBTENCIÓN DIRECTA: Evita depender de la variable local que podría estar desactualizada
//             const puntoVentaActual = this._usuarioService.getPuntoVentaActual;
//             if (!puntoVentaActual) {
//                 console.error('[Caja] No se puede abrir la caja: Punto de venta no asignado.');
//                 return;
//             }

//             const nuevaCaja = new Cajas();
//             nuevaCaja.cerrada = false; // Forzamos booleano
//             nuevaCaja.puntoVenta = puntoVentaActual;
//             nuevaCaja.fechaApertura = new Date();
//             nuevaCaja.montoInicial = montoInicialForzado ?? 0;
//             nuevaCaja.montoCierre = 0;
//             nuevaCaja.gastos = [];
//             nuevaCaja.datos = 0;
//             nuevaCaja.totales = {
//                 movimientos: 0, efectivo: 0, debito: 0, credito: 0,
//                 billetera: 0, transferencia: 0, cheque: 0, ctacte: 0
//             };
//             nuevaCaja.usuario = this.cuentaDatos?.usuario || 'Desconocido';

//             const idString = this.#idGenerator.generarId();
//             nuevaCaja.id = idString;

//             // 1. Guardar en IndexedDB
//             await firstValueFrom(this.#dbService.add('caja', nuevaCaja));

//             // 2. Notificar al gestor global (esto actualiza el botón en el listado)
//             this.#cajaGestor.notificarCambioEnCaja();

//             // 3. Actualizar el estado reactivo local
//             this.cajaData.set({ ...nuevaCaja });
//             this.cajaIdActual.set(idString);

//             console.log(`[Caja] Nueva caja creada y abierta exitosamente con ID: ${idString}`);

//             if (navegar) {
//                 this.#router.navigate(['/caja/listado']);
//             }

//         } catch (error) {
//             console.error('[Caja] Error crítico al crear la caja:', error);
//         }
//     }

//     async guardarCambiosCaja() {
//         const cajaActual = this.cajaData();
//         if (cajaActual) {
//             try {
//                 await firstValueFrom(this.#dbService.update('caja', cajaActual));
//                 this.#cajaGestor.notificarCambioEnCaja();
//             } catch (error) {
//                 console.error('[Caja] Error al guardar cambios:', error);
//             }
//         }
//     }

//     actualizarCaja(nuevaCaja: Caja) {
//         this.cajaData.set({ ...nuevaCaja });
//         this.guardarCambiosCaja();
//     }

//     actualizarMontoCierre(nuevoMonto: number) {
//         const caja = this.cajaData();
//         if (caja) {
//             this.cajaData.set({ ...caja, montoCierre: nuevoMonto });
//             this.guardarCambiosCaja();
//         }
//     }

//     async cerrarCaja() {
//         const caja = this.cajaData();
//         if (caja) {
//             caja.cerrada = true;
//             caja.fechaCierre = new Date();
//             this.cajaData.set({ ...caja });
//             await this.guardarCambiosCaja();
//             this.#router.navigate(['/caja/listado']);
//         }
//     }

//     salir() {
//         console.log('[Caja] Saliendo de la vista de arqueo.');
//     }
// }




///////////////////////////////////////////////////////////////////////////////////
// import { Component, computed, inject, signal, Optional, Inject, OnInit } from '@angular/core';
// import { ActivatedRoute, Router } from '@angular/router';
// import { DipsUsuarioService } from '@serv/usuario/usuario.service';
// import { NgxIndexedDBService } from 'ngx-indexed-db';
// import { firstValueFrom } from 'rxjs';
// import { Caja, Cajas } from '@dbTabla/caja.model';
// import { MatDialogModule, MAT_DIALOG_DATA } from '@angular/material/dialog';

// // Componentes de totales
// import { TotalEfectivoComponent } from './total-efectivo/total-efectivo.component';
// import { TotalDebitoComponent } from './total-debito/total-debito.component';
// import { TotalCreditoComponent } from './total-credito/total-credito.component';
// import { TotalBilleteraComponent } from './total-billetera/total-billetera.component';
// import { TotalChequeComponent } from './total-cheque/total-cheque.component';
// import { TotalTransferenciaComponent } from './total-transferencia/total-transferencia.component';
// import { TotalCtacteComponent } from './total-ctacte/total-ctacte.component';
// import { TotalGastoComponent } from './total-gasto/total-gasto.component';
// import { MontoInicialComponent } from './monto-inicial/monto-inicial.component';
// import { MontoArqueoComponent } from './monto-arqueo/monto-arqueo.component';

// import { MatButtonModule } from '@angular/material/button';
// import { NgIf } from '@angular/common';
// import { IdGeneratorService } from '@serv/uid/id-generador.service';
// import { CajaGestorService } from '../listado/service/gestor-caja.service';

// @Component({
//     selector: 'app-arqueo',
//     imports: [
//         MatDialogModule,
//         MatButtonModule,
//         NgIf,
//         TotalEfectivoComponent,
//         TotalDebitoComponent,
//         TotalCreditoComponent,
//         TotalBilleteraComponent,
//         TotalChequeComponent,
//         TotalTransferenciaComponent,
//         TotalCtacteComponent,
//         TotalGastoComponent,
//         MontoInicialComponent,
//         MontoArqueoComponent
//     ],
//     templateUrl: './arqueo.component.html',
//     styleUrls: ['./arqueo.component.scss']
// })
// export class ArqueoComponent implements OnInit {

//     #route = inject(ActivatedRoute);
//     #router = inject(Router);
//     #dbService = inject(NgxIndexedDBService);
//     #idGenerator = inject(IdGeneratorService);
//     #cajaGestor = inject(CajaGestorService);

//     cajaId?: string | null;
//     cuentaDatos: any;
//     puntoVenta: any;

//     cajaIdActual = signal<string | null>(null);
//     cajaData = signal<Caja | null>(null);

//     totalGastos = computed(() => {
//         const caja = this.cajaData();
//         if (!caja || !caja.gastos || caja.gastos.length === 0) return 0;
//         return caja.gastos.reduce((acumulado, gasto) => acumulado + (gasto.monto || 0), 0);
//     });

//     constructor(
//         private _usuarioService: DipsUsuarioService,
//         @Optional() @Inject(MAT_DIALOG_DATA) public dialogData?: any
//     ) { }

//     ngOnInit() {
//         this.cajaId = this.#route.snapshot.params['id'];

//         this._usuarioService.cuenta$.subscribe((cuenta) => {
//             this.cuentaDatos = cuenta;
//             if (cuenta) {
//                 this.puntoVenta = this._usuarioService.getPuntoVentaActual;
//                 const idAProcesar = this.cajaId ?? this.dialogData?.cajaId ?? null;

//                 // Solo evaluamos el estado, NO creamos nada automáticamente
//                 this.procesarEstadoCaja(idAProcesar);
//             }
//         });
//     }


//     /**
//      * Evalúa el ID recibido. Si es "todoCerrado" o null, deja el estado en vacío.
//      * Si es un ID válido, intenta cargarlo de la BD.
//      */
//     async procesarEstadoCaja(cajaIdEntrante?: string | null) {
//         if (!cajaIdEntrante || cajaIdEntrante === "todoCerrado") {
//             console.log('[Caja] Estado: Todo cerrado. Esperando acción del usuario para abrir.');
//             this.cajaIdActual.set("todoCerrado");
//             this.cajaData.set(null);
//             return;
//         }

//         try {
//             const cajaEncontrada = await firstValueFrom(
//                 this.#dbService.getByKey('caja', cajaIdEntrante)
//             ) as Caja | undefined;

//             if (cajaEncontrada) {
//                 this.cajaData.set({ ...cajaEncontrada });
//                 this.cajaIdActual.set(cajaEncontrada.id);
//             } else {
//                 console.warn(`[Caja] No se encontró caja con ID: ${cajaIdEntrante}.`);
//                 this.cajaIdActual.set("todoCerrado");
//                 this.cajaData.set(null);
//             }
//         } catch (error) {
//             console.error('[Caja] Error al cargar la caja:', error);
//             this.cajaIdActual.set("todoCerrado");
//             this.cajaData.set(null);
//         }
//     }

//     /**
//      * Se ejecuta cuando el componente hijo (MontoInicial) emite un cambio.
//      * Decide si debe abrir una caja nueva o solo actualizar una existente.
//      */
//     async actualizarMontoInicial(nuevoMonto: number) {
//         if (this.cajaIdActual() === 'todoCerrado') {
//             // ✅ Si está todo cerrado, abrimos la caja y asentamos este monto como inicio
//             console.log(`[Caja] Abriendo caja con monto inicial de: ${nuevoMonto}`);
//             await this.abrirNuevaCaja(nuevoMonto, false);
//         } else {
//             // ✅ Si ya hay una caja abierta, solo actualizamos el monto en la caja existente
//             const caja = this.cajaData();
//             if (caja) {
//                 this.cajaData.set({ ...caja, montoInicial: nuevoMonto });
//                 await this.guardarCambiosCaja();
//             }
//         }
//     }

//     /**
//      * Crea la caja y opcionalmente navega al listado.
//      * @param montoInicialForzado - Monto inicial de la caja
//      * @param navegar - Si es true, navega al listado de cajas después de crear
//      */
//     async abrirNuevaCaja(montoInicialForzado?: number, navegar: boolean = true) {
//         try {
//             console.log('[Caja] Iniciando creación de nueva caja...');

//             const nuevaCaja = new Cajas();

//             nuevaCaja.cerrada = false;

//             nuevaCaja.puntoVenta = this.puntoVenta;
//             nuevaCaja.fechaApertura = new Date();

//             // ✅ Usamos el monto forzado si viene del hijo, si no, 0 (por si se usa el botón "Abrir Caja")
//             nuevaCaja.montoInicial = montoInicialForzado ?? 0;

//             nuevaCaja.montoCierre = 0;
//             nuevaCaja.gastos = [];
//             nuevaCaja.datos = 0;
//             nuevaCaja.totales = {
//                 movimientos: 0, efectivo: 0, debito: 0, credito: 0,
//                 billetera: 0, transferencia: 0, cheque: 0, ctacte: 0
//             };
//             nuevaCaja.usuario = this.cuentaDatos?.usuario || 'Desconocido';

//             const idString = this.#idGenerator.generarId();
//             nuevaCaja.id = idString;

//             // 1. Guardar en IndexedDB
//             await firstValueFrom(this.#dbService.add('caja', nuevaCaja));

//             // 2. Notificar al gestor global
//             this.#cajaGestor.notificarCambioEnCaja();

//             // 3. Actualizar el estado reactivo local
//             this.cajaData.set({ ...nuevaCaja });
//             this.cajaIdActual.set(idString);

//             console.log(`[Caja] Nueva caja creada y abierta exitosamente con ID: ${idString}`);

//             console.log(`[Caja] Monto inicial  ${nuevaCaja}`);

//             // 4. Volver a la pantalla anterior (Listado de Cajas)
//             if (navegar) {
//                 this.#router.navigate(['/caja/listado']); // Ajusta '/cajas' a la ruta real de tu listado
//             }

//         } catch (error) {
//             console.error('[Caja] Error crítico al crear la caja:', error);
//         }
//     }

//     async guardarCambiosCaja() {
//         const cajaActual = this.cajaData();
//         if (cajaActual) {
//             try {
//                 await firstValueFrom(this.#dbService.update('caja', cajaActual));
//                 this.#cajaGestor.notificarCambioEnCaja();
//             } catch (error) {
//                 console.error('[Caja] Error al guardar cambios:', error);
//             }
//         }
//     }

//     actualizarCaja(nuevaCaja: Caja) {
//         this.cajaData.set({ ...nuevaCaja });
//         this.guardarCambiosCaja();
//     }


//     actualizarMontoCierre(nuevoMonto: number) {
//         const caja = this.cajaData();
//         if (caja) {
//             this.cajaData.set({ ...caja, montoCierre: nuevoMonto });
//             this.guardarCambiosCaja();
//         }
//     }

//     async cerrarCaja() {
//         const caja = this.cajaData();
//         if (caja) {
//             caja.cerrada = true;
//             caja.fechaCierre = new Date();
//             this.cajaData.set({ ...caja });
//             await this.guardarCambiosCaja();
//             this.#router.navigate(['/caja/listado']);
//         }
//     }

//     salir() {
//         // Lógica para volver al listado o cerrar el modal
//         console.log('[Caja] Saliendo de la vista de arqueo.');
//     }
// }
```
