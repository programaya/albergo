import { NgIf, NgClass } from '@angular/common';
import { Component, Inject, OnDestroy } from '@angular/core';

import {
  MatDialogRef,
  MAT_DIALOG_DATA,
} from '@angular/material/dialog';

import { DipsSonidoService } from '@serv/sonido/sonido.service';

import { isPlatformBrowser } from '@angular/common';

export interface DipsAlertaDato {
  mensaje: string;
  icon?: string;
  tipo?: 'success' | 'danger' | 'warning' | 'info' | 'light' | 'loading';
  autoTiempo?: number;
  sonido?: boolean;
  cargando?: boolean;              // ← Flag para modo procesamiento
  cerrable?: boolean;              // ← Control explícito de cierre manual
  progreso?: number;               // ← Opcional: 0-100 para barra de progreso
}

// Dialog Overview Example Dialog
@Component({
  selector: 'dips-alerta',
  templateUrl: 'dips-alerta.component.html',
  imports: [
    NgIf,
    NgClass
  ]
})
export class DipsAlertaComponent implements OnDestroy {

  classAlerta: string = ''
  iconAlerta: string = ''
  textoAlerta: string = ''
  sonidoAlerta: boolean = false

  esCargando: boolean = false;
  progreso?: number;
  private intervaloProgreso?: any;


  constructor(
    public dialogRef: MatDialogRef<DipsAlertaComponent>,
    private _sonidoService: DipsSonidoService,
    @Inject(MAT_DIALOG_DATA) public data: DipsAlertaDato
  ) {

    // Configuración inicial
    this.esCargando = data.cargando || data.tipo === 'loading';
    this.progreso = data.progreso;

    // Cierre automático si se define un tiempo
    if (data.autoTiempo && data.autoTiempo > 0) {
      setTimeout(() => {
        this.dialogRef.close();
      }, data.autoTiempo);
    }

    // Configuración de estilos
    if (this.esCargando) {
      this.classAlerta = 'alert alert-info d-flex align-items-center dips-loading';
      this.iconAlerta = data.icon || 'spinner';
    } else {
      // Lógica existente para tipos success/danger/etc.
      switch (data.tipo?.toLowerCase()) {
        case 'success': this.classAlerta = 'alert alert-success d-flex align-items-center'; break;
        case 'danger': this.classAlerta = 'alert alert-danger d-flex align-items-center'; break;
        case 'warning': this.classAlerta = 'alert alert-warning d-flex align-items-center'; break;
        case 'info': this.classAlerta = 'alert alert-info d-flex align-items-center'; break;
        case 'light': this.classAlerta = 'alert alert-light d-flex align-items-center'; break;
        case 'loading': this.classAlerta = 'alert alert-light d-flex align-items-center'; break;
        default: this.classAlerta = 'alert alert-secondary d-flex align-items-center';
      }
      this.iconAlerta = data.icon || '';
    }

    //this.iconAlerta = data.icon ? data.icon : '';
    this.textoAlerta = data.mensaje;
    this.sonidoAlerta = data.sonido ? data.sonido : false;

    // if (this.sonidoAlerta) {
    //   this._sonidoService.reproducirSonido('sonido/alerta.mp3')
    // }

    // Sonido solo si no es loading
    if (data.sonido && !this.esCargando) {
      this._sonidoService.reproducirSonido('sonido/alerta.mp3');
    }

    // Configurar disableClose según modo
    if (this.esCargando) {
      this.dialogRef.disableClose = true;
    } else if (data.cerrable !== undefined) {
      this.dialogRef.disableClose = !data.cerrable;
    }

  }

  // cerrar(): void {
  //   this.dialogRef.close();
  // }

  // Opcional: actualizar progreso dinámicamente desde fuera
  actualizarProgreso(valor: number): void {
    this.progreso = Math.min(100, Math.max(0, valor));
  }

  cerrar(): void {
    if (!this.esCargando || this.dialogRef.disableClose === false) {
      this.dialogRef.close();
    }
  }

  ngOnDestroy(): void {
    if (this.intervaloProgreso) {
      clearInterval(this.intervaloProgreso);
    }
  }

}
