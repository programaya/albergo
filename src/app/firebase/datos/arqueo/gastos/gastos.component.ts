// app/principal/caja/arqueo/total-gasto/total-gasto.component.ts
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Caja } from '../../caja.model';
import { ModalGastosComponent } from '../modal-gastos/modal-gastos.component';

@Component({
  selector: 'app-total-gasto',
  templateUrl: './total-gasto.component.html',
  styleUrls: ['./total-gasto.component.scss']
})
export class TotalGastoComponent {
  @Input() total: number = 0;
  @Input() caja: Caja | null = null;
  @Output() cajaModificada = new EventEmitter<Caja>();

  constructor(private _dialog: MatDialog) { }

  get puedeEditar(): boolean {
    return !(this.caja && this.caja.cerrada);
  }

  abrirModalGastos(): void {
    if (!this.puedeEditar) return;

    const dialogRef = this._dialog.open(ModalGastosComponent, {
      width: '500px',
      disableClose: true,
      data: { caja: this.caja }
    });

    dialogRef.afterClosed().subscribe((cajaActualizada?: Caja) => {
      if (cajaActualizada) {
        this.cajaModificada.emit(cajaActualizada);
      }
    });
  }

  getEnteros(): string {
    const valor = this.total;
    const parteEntera = valor >= 0 ? Math.floor(valor) : Math.ceil(valor);
    return parteEntera.toLocaleString('es-AR');
  }

  getDecimales(): string {
    const valor = Math.abs(this.total);
    return (valor % 1).toFixed(2).slice(2);
  }
}