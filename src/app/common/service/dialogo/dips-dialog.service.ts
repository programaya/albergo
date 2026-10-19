// dips-dialogo.service.ts
import { Injectable } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Observable } from 'rxjs';
import { DipsDialogo } from './dips-dialogo.component';
import { DipsDialogoData, DipsDialogoType } from './dips-dialogo.interface';

@Injectable({
  providedIn: 'root'
})
export class DipsDialogoService {

  constructor(private dialog: MatDialog) {}

  /**
   * Abre el diálogo con configuración parcial. Completa con valores por defecto.
   */
  open(config: Partial<DipsDialogoData> & { linea1: string }): MatDialogRef<DipsDialogo> {
    // Valores por defecto según el tipo (si aplica)
    const tipo = config.tipo ?? 'info';

    // Determinar título por defecto según el tipo
    const defaultTitle = this._getDefaultTitle(tipo);

    // Construir el objeto completo
    const data: DipsDialogoData = {
      linea1: config.linea1,
      titulo: config.titulo ?? defaultTitle,
      linea2: config.linea2,
      linea3: config.linea3,
      btnAceptar: config.btnAceptar ?? this._getDefaultAceptar(tipo),
      btnCancela: config.btnCancela ?? 'No',
      unBoton: config.unBoton ?? (tipo === 'none' || tipo === 'info' || tipo === 'success' || tipo === 'warning' || tipo === 'light' || tipo === 'danger'),
      tipo
    };

    return this.dialog.open(DipsDialogo, {
      width: '250px',
      enterAnimationDuration: '300ms',
      exitAnimationDuration: '150ms',
      data,// import { DipsAlertaService } from  '../../common/service/alerta/dips-alerta.service';
      hasBackdrop: true,
      closeOnNavigation: true
    });
  }

  private _getDefaultTitle(tipo: DipsDialogoType): string {
    switch (tipo) {
      case 'success': return 'Éxito';
      case 'danger': return 'Error';
      case 'warning': return 'Advertencia';
      case 'info': return 'Información';
      case 'light': return 'Nota';
      case 'none': return 'Mensaje';
      default: return 'Mensaje';
    }
  }

  private _getDefaultAceptar(tipo: DipsDialogoType): string {
    switch (tipo) {
      case 'success': return 'Aceptar';
      case 'danger': return 'Entendido';
      case 'warning': return 'Aceptar';
      case 'info': return 'Aceptar';
      case 'light': return 'Cerrar';
      case 'none': return 'Aceptar';
      default: return 'Aceptar';
    }
  }

  // === Métodos de conveniencia (más simples) ===

  info(linea1: string, config: Partial<DipsDialogoData> = {}): Observable<boolean | undefined> {
    return this.open({ ...config, linea1, tipo: 'info' }).afterClosed();
  }

  success(linea1: string, config: Partial<DipsDialogoData> = {}): Observable<boolean | undefined> {
    return this.open({ ...config, linea1, tipo: 'success' }).afterClosed();
  }

  warning(linea1: string, config: Partial<DipsDialogoData> = {}): Observable<boolean | undefined> {
    return this.open({ ...config, linea1, tipo: 'warning' }).afterClosed();
  }

  danger(linea1: string, config: Partial<DipsDialogoData> = {}): Observable<boolean | undefined> {
    return this.open({ ...config, linea1, tipo: 'danger' }).afterClosed();
  }

  light(linea1: string, config: Partial<DipsDialogoData> = {}): Observable<boolean | undefined> {
    return this.open({ ...config, linea1, tipo: 'light' }).afterClosed();
  }

  standard(linea1: string, config: Partial<DipsDialogoData> = {}): Observable<boolean | undefined> {
    return this.open({ ...config, linea1, tipo: 'none' }).afterClosed();
  }

  confirm(
    linea1: string,
    config: Partial<DipsDialogoData> = {}
  ): Observable<boolean | undefined> {
    return this.open({
      ...config,
      linea1,
      tipo: config.tipo ?? 'none',
      unBoton: false,
      btnAceptar: config.btnAceptar ?? 'Sí',
      btnCancela: config.btnCancela ?? 'No'
    }).afterClosed();
  }

  alert(linea1: string, config: Partial<DipsDialogoData> = {}): Observable<boolean | undefined> {
    return this.open({ ...config, linea1 }).afterClosed();
  }

  closeAll(): void {
    this.dialog.closeAll();
  }
}