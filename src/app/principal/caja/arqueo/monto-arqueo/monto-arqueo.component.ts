import { Component, ElementRef, HostListener, Input, Output, EventEmitter, ViewChild, AfterViewInit, OnChanges } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { FormsModule } from '@angular/forms';
import { MatIcon } from '@angular/material/icon';
import { Caja } from '@base/src/app/DBase/Modelos/caja.model';
import { DatePipe, DecimalPipe } from '@angular/common';

@Component({
    selector: 'app-monto-arqueo',
    templateUrl: './monto-arqueo.component.html',
    styleUrls: ['./monto-arqueo.component.scss']
})
export class MontoArqueoComponent implements AfterViewInit, OnChanges {
    @Input() cajaData: Caja | null = null;
    @Input() total: number = 0;
    @Output() totalChange = new EventEmitter<number>();

    editando = false;
    @ViewChild('inputMonto') inputMonto!: ElementRef<HTMLInputElement>;
    diferencia = 0;

    constructor(private el: ElementRef) { }

    ngAfterViewInit(): void {
        this.calcularDiferencia();
    }

    ngOnChanges(): void {
        this.calcularDiferencia();
    }

    private calcularDiferencia(): void {
        const gastosTotal = this.cajaData?.gastos?.reduce((acc, gasto) => acc + gasto.monto, 0) || 0;
        this.diferencia = (this.total || 0) - (this.cajaData?.totales?.efectivo || 0) - (this.cajaData?.montoInicial || 0) - gastosTotal;

        if (this.editando && this.inputMonto) {
            this.inputMonto.nativeElement.focus();
            this.inputMonto.nativeElement.select();
        }
    }

    activarEdicion(): void {
        this.editando = true;
        setTimeout(() => {
            if (this.inputMonto) {
                this.inputMonto.nativeElement.focus();
                this.inputMonto.nativeElement.select();
            }
        });
    }

    desactivarEdicion(valorStr: string): void {
        if (!this.editando) return;
        const limpio = valorStr.replace(/\./g, '').replace(',', '.');
        const numero = parseFloat(limpio) || 0;
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