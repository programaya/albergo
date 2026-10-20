Project files:

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
