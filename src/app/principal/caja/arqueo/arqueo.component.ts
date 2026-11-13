import { Component, OnInit, OnDestroy, Inject, Optional } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Subject } from 'rxjs';
import { takeUntil, take } from 'rxjs/operators';

import { DipsUsuarioService } from 'src/@dips/services/usuario.service';
import { DipsUtils } from 'src/@dips/utils';
import { DipsConfirmDialogComponent } from 'src/@dips/components/confirm-dialog/confirm-dialog.component';
import { ArqueoDatabase } from './arqueo.database';
import { Caja, MovimientoCaja, TotalesCaja, totalMovimientosManuales } from './arqueo.model';
import { Usuarios } from 'src/app/sesion/cuenta.model';
import { DetalleArqueoComponent } from './detalle-arqueo/detalle-arqueo.component';

@Component({
  selector: 'app-arqueo',
  templateUrl: './arqueo.component.html',
  styleUrls: ['./arqueo.component.scss']
})
export class ArqueoComponent implements OnInit, OnDestroy {
  cajaId?: string | null;
  cajaIdActual: string | null = null;
  cajaData: Caja | null = null;
  guardandoMontoInicial = false;

  private _unsubscribeAll = new Subject<void>();
  usuario: Usuarios = new Usuarios();

  constructor(
    private _route: ActivatedRoute,
    private _router: Router,
    private _usuarioService: DipsUsuarioService,
    private _arqueoDB: ArqueoDatabase,
    private _matSnackBar: MatSnackBar,
    private _matDialog: MatDialog,
    @Optional() @Inject(MAT_DIALOG_DATA) public dialogData?: any
  ) { }

  ngOnInit() {
    console.log('ArqueoComponent initialized with cajaId:', this._route.snapshot.params['id'], 'and dialogData:', this.dialogData);
    this.cajaId = this._route.snapshot.params['id'];
    this._usuarioService.getUsuario()
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((usuario) => {
        this.usuario = usuario;
        if (usuario && usuario.email) {
          const idAProcesar = this.cajaId ?? this.dialogData?.cajaId ?? null;
          this.procesarEstadoCaja(idAProcesar);
        }
      });
  }

  ngOnDestroy() {
    this._unsubscribeAll.next();
    this._unsubscribeAll.complete();
  }

  get totalMovimientos(): number {
    return totalMovimientosManuales(this.cajaData);
  }

  abrirDetalle(): void {
    if (!this.cajaData) return;
    this._matDialog.open(DetalleArqueoComponent, {
      width: '1200px', maxWidth: '95vw', maxHeight: '95vh',
      autoFocus: false, data: this.cajaData
    });
  }

  readonly mediosPago: { clave: keyof TotalesCaja; nombre: string; icono: string }[] = [
    { clave: 'efectivo', nombre: 'Efectivo', icono: 'payments' },
    { clave: 'cheque', nombre: 'Cheques', icono: 'receipt_long' },
    { clave: 'debito', nombre: 'Débito', icono: 'credit_card' },
    { clave: 'credito', nombre: 'Crédito', icono: 'credit_card' },
    { clave: 'transferencia', nombre: 'Transferencias', icono: 'account_balance' },
    { clave: 'billetera', nombre: 'Billeteras virtuales', icono: 'account_balance_wallet' },
    { clave: 'ctacte', nombre: 'Cuenta corriente', icono: 'account_box' }
  ];

  totalMedio(clave: keyof TotalesCaja): number {
    return Number(this.cajaData?.totales?.[clave] || 0);
  }

  get totalIngresos(): number {
    return this.mediosPago.reduce((total, medio) => total + this.totalMedio(medio.clave), 0);
  }

  async procesarEstadoCaja(cajaIdEntrante?: string | null) {
    if (!cajaIdEntrante) {
      this._arqueoDB.ultima()
        .pipe(take(1), takeUntil(this._unsubscribeAll))
        .subscribe(caja => {
          this.cajaData = caja && !caja.cerrada ? caja : null;
          this.cajaIdActual = this.cajaData?.id || 'todoCerrado';
        });
      return;
    }
    if (cajaIdEntrante === 'todoCerrado') {
      this.cajaIdActual = 'todoCerrado';
      this.cajaData = null;
      return;
    }
    this._arqueoDB.simple(cajaIdEntrante)
      .pipe(take(1))
      .subscribe((item: any) => {
        if (item.payload.exists) {
          this.cajaData = new Caja(item.payload.data());
          this.cajaIdActual = this.cajaData.id;
        } else {
          this.cajaIdActual = 'todoCerrado';
          this.cajaData = null;
        }
      });
  }

  async actualizarMontoInicial(nuevoMonto: number) {
    if (this.guardandoMontoInicial || !Number.isFinite(nuevoMonto) || nuevoMonto < 0 ||
        (this.cajaData && (this.cajaData.cerrada || this.cajaData.montoInicial !== 0 ||
          this.cajaData.movimientos.some(movimiento => movimiento.datos === '9')))) return;
    this.guardandoMontoInicial = true;
    try {
      if (this.cajaIdActual === 'todoCerrado' || !this.cajaIdActual) {
        await this.abrirNuevaCaja(nuevoMonto, false);
      } else if (this.cajaData) {
          this.cajaData = {
            ...this.cajaData, montoInicial: nuevoMonto,
            movimientos: [...this.cajaData.movimientos, this.crearMovimientoImporte(nuevoMonto, false)]
          };
          await this.guardarCambiosCaja();
      }
    } finally {
      this.guardandoMontoInicial = false;
    }
  }

  async actualizarMovimientos(cajaConMovimientos: Caja) {
    if (this.cajaIdActual === 'todoCerrado' || !this.cajaIdActual) {
      await this.abrirNuevaCajaConMovimientos(cajaConMovimientos);
    } else {
      this.cajaData = { ...cajaConMovimientos };
      await this.guardarCambiosCaja();
    }
  }

  async abrirNuevaCajaConMovimientos(cajaConMovimientos: Caja) {
    const nuevaCaja = this._crearCajaBase();
    nuevaCaja.movimientos = cajaConMovimientos.movimientos || [];
    nuevaCaja.id = DipsUtils.generateGUID();
    await this._arqueoDB.ingresaDato(nuevaCaja);
    this.cajaData = { ...nuevaCaja };
    this.cajaIdActual = nuevaCaja.id;
  }

  async abrirNuevaCaja(montoInicialForzado?: number, navegar: boolean = true) {
    const nuevaCaja = this._crearCajaBase();
    nuevaCaja.montoInicial = montoInicialForzado ?? 0;
    if (montoInicialForzado !== undefined) {
      nuevaCaja.movimientos.push(this.crearMovimientoImporte(montoInicialForzado, false));
    }
    nuevaCaja.id = DipsUtils.generateGUID();
    await this._arqueoDB.ingresaDato(nuevaCaja);
    this.cajaData = { ...nuevaCaja };
    this.cajaIdActual = nuevaCaja.id;
    if (navegar) {
      this._router.navigate(['/principal/caja/listado']);
    }
  }

  private _crearCajaBase(): Caja {
    const nuevaCaja = new Caja();
    nuevaCaja.cerrada = true;
    nuevaCaja.puntoVenta = this.usuario.idCuenta || '';
    nuevaCaja.fechaApertura = new Date();
    nuevaCaja.montoInicial = 0;
    nuevaCaja.montoCierre = 0;
    nuevaCaja.movimientos = [];
    nuevaCaja.datos = 0;
    nuevaCaja.totales = {
      movimientos: 0, efectivo: 0, debito: 0, credito: 0,
      billetera: 0, transferencia: 0, cheque: 0, ctacte: 0
    };
    nuevaCaja.usuario = this.usuario.email || 'Desconocido';
    return nuevaCaja;
  }

  async guardarCambiosCaja() {
    if (this.cajaData) {
      await this._arqueoDB.actualizaDato(this.cajaData.id, this.cajaData);
    }
  }

  private crearMovimientoImporte(monto: number, rendicion: boolean): MovimientoCaja {
    const fecha = new Date();
    return {
      fechaInicio: fecha,
      fechaFin: fecha,
      tipo: rendicion ? 'Rendición' : 'Apertura',
      descripcion: rendicion ? 'Importe total rendido' : 'Saldo inicial',
      monto,
      usuario: this.usuario.email || '',
      datos: rendicion ? 'A' : '9'
    };
  }

  fechaFinMovimiento(movimiento: MovimientoCaja): Date | null {
    const fecha = movimiento.fechaFin as any;
    return fecha?.toDate ? fecha.toDate() : (fecha ?? null);
  }

  async actualizarMontoCierre(nuevoMonto: number) {
    if (this.cajaData && !this.cajaData.cerrada && Number.isFinite(nuevoMonto) && nuevoMonto >= 0 &&
        this.cajaData.montoCierre === 0 &&
        !this.cajaData.movimientos.some(movimiento => movimiento.datos === 'A')) {
      this.cajaData = {
        ...this.cajaData, montoCierre: nuevoMonto,
        movimientos: [...this.cajaData.movimientos, this.crearMovimientoImporte(nuevoMonto, true)]
      };
      await this.guardarCambiosCaja();
    }
  }

  verificaCierre() {
    const diferencia = (this.cajaData?.montoCierre || 0) -
      (this.cajaData?.totales.efectivo || 0) -
      (this.cajaData?.montoInicial || 0) -
      this.totalMovimientos;

    if (diferencia !== 0) {
      const dialogRef = this._matDialog.open(DipsConfirmDialogComponent, {
        disableClose: false
      });
      dialogRef.componentInstance.confirmMessage =
        `La diferencia entre el monto de cierre y los totales es de $${diferencia}.\n\n¿Desea continuar con el cierre de la caja?`;
      dialogRef.afterClosed().subscribe((result) => {
        if (result) this.cerrarCaja();
      });
    } else {
      this.cerrarCaja();
    }
  }

  async cerrarCaja() {
    if (this.cajaData) {
      this.cajaData.cerrada = true;
      this.cajaData.fechaCierre = new Date();
      await this.guardarCambiosCaja();
      this._router.navigate(['/principal/caja/listado']);
    }
  }
}
