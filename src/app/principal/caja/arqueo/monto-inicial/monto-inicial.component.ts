import { Component, ElementRef, HostListener, Input, Output, EventEmitter, ViewChild, AfterViewInit, OnChanges } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { FormsModule } from '@angular/forms';
import { MatIcon } from '@angular/material/icon';
import { Caja } from '@base/src/app/DBase/Modelos/caja.model';
import { DatePipe } from '@angular/common';

@Component({
    selector: 'app-monto-inicial',
    templateUrl: './monto-inicial.component.html',
    styleUrls: ['./monto-inicial.component.scss']
})
export class MontoInicialComponent implements AfterViewInit, OnChanges {
    @Input() cajaData: Caja | null = null;
    @Input() total: number = 0;
    @Output() totalChange = new EventEmitter<number>();

    editando = false;
    @ViewChild('inputMonto') inputMonto!: ElementRef<HTMLInputElement>;

    constructor(private el: ElementRef) { }

    ngAfterViewInit(): void {
        this.actualizarFocus();
    }

    ngOnChanges(): void {
        this.actualizarFocus();
    }

    get puedeEditar(): boolean {
        if (this.total !== 0) return false;
        if (this.cajaData === null) return true;
        if (this.cajaData.cerrada === false) return true;
        return false;
    }

    private actualizarFocus(): void {
        if (this.editando && this.inputMonto) {
            this.inputMonto.nativeElement.focus();
            this.inputMonto.nativeElement.select();
        }
    }

    activarEdicion(): void {
        if (this.puedeEditar) {
            this.editando = true;
            setTimeout(() => {
                if (this.inputMonto) {
                    this.inputMonto.nativeElement.focus();
                    this.inputMonto.nativeElement.select();
                }
            });
        } else {
            console.warn('No se permite editar el monto inicial en el estado actual de la caja.');
        }
    }

    desactivarEdicion(valorStr: string): void {
        if (!this.editando) return;
        const limpio = valorStr.replace(/\./g, '').replace(',', '.');
        let numero = parseFloat(limpio) || 0;
        if (numero < 0) {
            numero = 0;
            console.warn('No se permiten montos negativos. Se estableció en 0.');
        }
        this.total = numero;
        this.totalChange.emit(this.total);
        this.editando = false;
    }

    @HostListener('document:click', ['$event'])
    onClickOutside(event: MouseEvent): void {
        if (this.editando && !this.el.nativeElement.contains(event.target as Node)) {
            if (this.inputMonto) {
                this.desactivarEdicion(this.inputMonto.nativeElement.value);
            }
        }
    }

    getEnteros(): string {
        return Math.floor(this.total).toLocaleString('es-AR');
    }

    getDecimales(): string {
        return (this.total % 1).toFixed(2).slice(2);
    }
}