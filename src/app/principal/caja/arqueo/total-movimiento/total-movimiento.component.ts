import { Component, Input, Output, EventEmitter, Inject } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Caja } from '../arqueo.model';
import { ModalMovimientosComponent } from '../modal-movimientos/modal-movimientos.component'

@Component({
  selector: 'app-total-movimiento',
  templateUrl: './total-movimiento.component.html',
  styleUrls: ['./total-movimiento.component.scss']
})
export class TotalMovimientoComponent {
  @Input() total: number = 0;
  @Input() usuario: string = '';
  @Input() caja: Caja | null = null;
  @Output() cajaModificada = new EventEmitter<Caja>();

  constructor(private _dialog: MatDialog) { }

  get puedeEditar(): boolean {
    return !(this.caja && this.caja.cerrada);
  }

  abrirModalMovimientos() {
    if (!this.puedeEditar) return;

    const dialogRef = this._dialog.open(ModalMovimientosComponent, {
      width: '550px',
      disableClose: true,
      data: { caja: this.caja, usuario: this.usuario }
    });

    dialogRef.afterClosed().subscribe((cajaActualizada: Caja | undefined) => {
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