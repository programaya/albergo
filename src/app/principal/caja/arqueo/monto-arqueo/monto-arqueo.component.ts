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