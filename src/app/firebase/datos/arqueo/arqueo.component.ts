// app/principal/caja/arqueo/arqueo.component.ts
import { Component, OnInit, OnDestroy, Inject, Optional } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Subject } from 'rxjs';
import { takeUntil, take } from 'rxjs/operators';

import { DipsUsuarioService } from 'src/@dips/services/usuario.service';
import { DipsDialogoService } from 'src/app/common/service/dialogo/dips-dialog.service';
import { DipsUtils } from 'src/app/common/utils';
import { CajasDatabase } from './caja/caja.database';
import { Caja, Cajas } from './caja/caja.model';

@Component({
  selector: 'app-arqueo',
  templateUrl: './arqueo.component.html',
  styleUrls: ['./arqueo.component.scss']
})
export class ArqueoComponent implements OnInit, OnDestroy {
  cuentaDatos: any;
  puntoVenta: any;

  // Estado reactivo (reemplaza signals)
  cajaIdActual: string | null = null;
  cajaData: Caja | null = null;

  // Computed: total de gastos
  get totalGastos(): number {
    if (!this.cajaData || !this.cajaData.gastos || this.cajaData.gastos.length === 0) return 0;
    return this.cajaData.gastos.reduce((acc, g) => acc + (g.monto || 0), 0);
  }

  private cajaId?: string | null;
  private _unsubscribeAll = new Subject<any>();

  constructor(
    private _route: ActivatedRoute,
    private _router: Router,
    private _usuarioService: DipsUsuarioService,
    private _cajaDB: CajasDatabase,
    private _dialogo: DipsDialogoService,
    private _matDialog: MatDialog,
    @Optional() @Inject(MAT_DIALOG_DATA) public dialogData?: any
  ) { }

  ngOnInit(): void {
    this.cajaId = this._route.snapshot.params['id'];

    this._usuarioService.cuenta$.pipe(takeUntil(this._unsubscribeAll))
      .subscribe(cuenta => {
        this.cuentaDatos = cuenta;
        if (cuenta) {

          const idAProcesar = this.cajaId ?? this.dialogData?.cajaId ?? null;
          this.procesarEstadoCaja(idAProcesar);
        }
      });
  }

  ngOnDestroy(): void {
    this._unsubscribeAll.next();
    this._unsubscribeAll.complete();
  }

  async procesarEstadoCaja(cajaIdEntrante?: string | null): Promise<void> {
    if (!cajaIdEntrante || cajaIdEntrante === 'todoCerrado') {
      this.cajaIdActual = 'todoCerrado';
      this.cajaData = null;
      return;
    }
    try {
      const caja = await this._cajaDB.getById(cajaIdEntrante);
      if (caja) {
        this.cajaData = { ...caja };
        this.cajaIdActual = caja.id || null;
      } else {
        this.cajaIdActual = 'todoCerrado';
        this.cajaData = null;
      }
    } catch (err) {
      console.error('[Caja] Error al cargar la caja:', err);
      this.cajaIdActual = 'todoCerrado';
      this.cajaData = null;
    }
  }

  async actualizarMontoInicial(nuevoMonto: number): Promise<void> {
    if (this.cajaIdActual === 'todoCerrado' || !this.cajaIdActual) {
      await this.abrirNuevaCaja(nuevoMonto, false);
    } else if (this.cajaData) {
      this.cajaData = { ...this.cajaData, montoInicial: nuevoMonto };
      await this.guardarCambiosCaja();
    }
  }

  async actualizarGastos(cajaConGastos: Caja): Promise<void> {
    if (this.cajaIdActual === 'todoCerrado' || !this.cajaIdActual) {
      await this.abrirNuevaCajaConGastos(cajaConGastos);
    } else {
      this.cajaData = { ...cajaConGastos };
      await this.guardarCambiosCaja();
    }
  }

  async abrirNuevaCajaConGastos(cajaConGastos: Caja): Promise<void> {
    try {

      const nueva = new Cajas();
      nueva.cerrada = false;
      nueva.fechaApertura = new Date();
      nueva.montoInicial = 0;
      nueva.montoCierre = 0;
      nueva.gastos = cajaConGastos.gastos || [];
      nueva.datos = 0;
      nueva.totales = {
        movimientos: 0, efectivo: 0, debito: 0, credito: 0,
        billetera: 0, transferencia: 0, cheque: 0, ctacte: 0
      };
      nueva.usuario = this.cuentaDatos?.usuario || 'Desconocido';
      nueva.emailEncargado = this.cuentaDatos?.email || '';
      nueva.uidEncargado = this.cuentaDatos?.uid || '';
      nueva.uid = DipsUtils.generateGUID();
      nueva.id = nueva.uid;

      await this._cajaDB.ingresaDatoID(nueva.uid, nueva);
      this.cajaData = { ...nueva };
      this.cajaIdActual = nueva.uid;
    } catch (err) {
      console.error('[Caja] Error al crear caja con gastos:', err);
    }
  }

  async abrirNuevaCaja(montoInicialForzado?: number, navegar = true): Promise<void> {
    try {

      const nueva = new Cajas();
      nueva.cerrada = false;
      nueva.fechaApertura = new Date();
      nueva.montoInicial = montoInicialForzado ?? 0;
      nueva.montoCierre = 0;
      nueva.gastos = [];
      nueva.datos = 0;
      nueva.totales = {
        movimientos: 0, efectivo: 0, debito: 0, credito: 0,
        billetera: 0, transferencia: 0, cheque: 0, ctacte: 0
      };
      nueva.usuario = this.cuentaDatos?.usuario || 'Desconocido';
      nueva.emailEncargado = this.cuentaDatos?.email || '';
      nueva.uidEncargado = this.cuentaDatos?.uid || '';
      nueva.uid = DipsUtils.generateGUID();
      nueva.id = nueva.uid;

      await this._cajaDB.ingresaDatoID(nueva.uid, nueva);
      this.cajaData = { ...nueva };
      this.cajaIdActual = nueva.uid;

      if (navegar) {
        this._router.navigate(['/caja/listado']);
      }
    } catch (err) {
      console.error('[Caja] Error al crear caja:', err);
    }
  }

  async guardarCambiosCaja(): Promise<void> {
    if (this.cajaData && this.cajaData.id) {
      try {
        await this._cajaDB.actualizaDato(this.cajaData.id, this.cajaData);
      } catch (err) {
        console.error('[Caja] Error al guardar:', err);
      }
    }
  }

  actualizarMontoCierre(nuevoMonto: number): void {
    if (this.cajaData) {
      this.cajaData = { ...this.cajaData, montoCierre: nuevoMonto };
      this.guardarCambiosCaja();
    }
  }

  async verificaCierre(): Promise<void> {
    const caja = this.cajaData;
    if (!caja) return;

    const gastos = (caja.gastos || []).reduce((a, g) => a + (g.monto || 0), 0);
    const diferencia = (caja.montoCierre || 0)
      - (caja.totales?.efectivo || 0)
      - (caja.montoInicial || 0)
      - gastos;

    if (diferencia !== 0) {
      this._dialogo.confirm(
        `La diferencia entre el monto de cierre y los totales es de $${diferencia}.\n\n¿Desea continuar con el cierre?`,
        { titulo: 'Confirmar cierre de caja', btnAceptar: 'Continuar', btnCancela: 'Cancelar', tipo: 'info' }
      ).subscribe(async (ok) => {
        if (ok) await this.cerrarCaja();
      });
    } else {
      await this.cerrarCaja();
    }
  }

  async cerrarCaja(): Promise<void> {
    if (this.cajaData) {
      this.cajaData = {
        ...this.cajaData,
        cerrada: true,
        fechaCierre: Date.now()
      };
      await this.guardarCambiosCaja();
      this._router.navigate(['/caja/listado']);
    }
  }
}