
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
