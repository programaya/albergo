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
