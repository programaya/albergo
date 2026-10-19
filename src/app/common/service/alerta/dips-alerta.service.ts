// alert.service.ts
import { MatDialog } from '@angular/material/dialog';
import { DipsAlertaComponent, DipsAlertaDato } from './dips-alerta.component';
import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class DipsAlertaService {

  // para el sonido
  private audio: HTMLAudioElement | null = null;
  private isBrowser: boolean;

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private dialog: MatDialog) {

    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  open(data: DipsAlertaDato): void {
    this.dialog.open(DipsAlertaComponent, {
      data,
      // width: '400px',
      // maxWidth: '90vw',
      hasBackdrop: true,
      disableClose: !data.autoTiempo, // permite cerrar manual si no hay autoClose
      closeOnNavigation: true
    });
  }

  // Atajos rápidos
  success(mensaje: string, icon?: string, autoTiempo?: number, sonido: boolean = false): void {
    this.open({
      mensaje,
      icon,
      tipo: 'success',
      autoTiempo,
      sonido
    });
  }

  danger(mensaje: string, icon?: string, autoTiempo?: number, sonido: boolean = false): void {
    this.open({
      mensaje,
      icon,
      tipo: 'danger',
      autoTiempo,
      sonido
    });
  }

  warning(mensaje: string, icon?: string, autoTiempo?: number, sonido: boolean = false): void {
    this.open({
      mensaje,
      icon,
      tipo: 'warning',
      autoTiempo,
      sonido
    });
  }

  info(mensaje: string, icon?: string, autoTiempo?: number, sonido: boolean = false): void {
    this.open({
      mensaje,
      icon,
      tipo: 'info',
      autoTiempo,
      sonido
    });
  }

  light(mensaje: string, icon?: string, autoTiempo?: number, sonido: boolean = false): void {
    this.open({
      mensaje,
      icon,
      tipo: 'light',
      autoTiempo,
      sonido
    });
  }

  /**
   * Muestra una alerta de procesamiento que permanece abierta hasta cerrar() explícito
   */
  loading(mensaje: string, icon?: string, progreso?: number): void {
    this.open({
      mensaje,
      icon,
      tipo: 'loading',
      cargando: true,
      cerrable: false,        // No permitir cierre manual durante proceso
      progreso,
      autoTiempo: undefined,  // Ignorar auto-close en modo loading
      sonido: false
    });
  }

  /**
   * Versión utilitaria para ejecutar un proceso y manejar apertura/cierre automáticamente
   */
  async withLoading<T>(
    proceso: () => Promise<T>,
    mensaje: string = 'Procesando...',
    icon: string = 'spinner'
  ): Promise<T> {
    this.loading(mensaje, icon);
    try {
      return await proceso();
    } finally {
      this.cerrar();
    }
  }

  cerrar(): void {
    this.dialog.closeAll();
  }

}

//* uso en un componente
// cualquier-componente.ts
/**
import { Component } from '@angular/core';
import { AlertService } from './alert.service';

....


export class HomeComponent {
  constructor(private alertService: AlertService) {}

  mostrarExito(): void {
    this.alertService.success('¡Todo salió bien!', 'Éxito', 2000);
  }

  this.alertService.cerrar()
*/
