// dips-dialog.component.ts
import { Component, Inject } from '@angular/core';

// Material
import { 
    MatDialogRef, 
    MAT_DIALOG_DATA, 
    MatDialogTitle,
    MatDialogContent,
    MatDialogActions,
    MatDialogClose} from '@angular/material/dialog';
import { MatButton } from '@angular/material/button';

import { DipsDialogoData, DipsDialogoType } from './dips-dialogo.interface';
import { NgIf } from '@angular/common';

@Component({
  selector: 'dips-dialogo',
  templateUrl: 'dips-dialogo.component.html',
  styleUrls: ['./dips-dialogo.component.scss'], // opcional, si usas SCSS
  imports: [
    MatButton,           // componente standalone
    MatDialogTitle,
    MatDialogContent,
    MatDialogActions,
    MatDialogClose,
    NgIf
    
  ]
})
export class DipsDialogo {
  titulo: string = '';
  linea1: string = '';
  linea2?: string;
  linea3?: string;
  btnAceptar: string = 'Ok';
  btnCancela: string = 'No';
  unBoton: boolean = false;
  containerClass: string = '';

  constructor(
    public dialogRef: MatDialogRef<DipsDialogo>,
    @Inject(MAT_DIALOG_DATA) private _dato: DipsDialogoData
  ) {
    this.titulo = this._dato.titulo ?? '';
    this.linea1 = this._dato.linea1;
    this.linea2 = this._dato.linea2;
    this.linea3 = this._dato.linea3;
    this.btnAceptar = this._dato.btnAceptar ?? 'Ok';
    this.btnCancela = this._dato.btnCancela ?? 'No';
    this.unBoton = this._dato.unBoton ?? false;

    // Aplicar clase según el tipo
    if (this._dato.tipo === 'none') {
      this.containerClass = ''; // sin clase de alerta
    } else {
      switch (this._dato.tipo) {
        case 'success':
          this.containerClass = 'alert alert-bg-success';
          break;
        case 'danger':
          this.containerClass = 'alert alert-bg-danger';
          break;
        case 'warning':
          this.containerClass = 'alert alert-bg-warning';
          break;
        case 'info':
          this.containerClass = 'alert alert-bg-info';
          break;
        case 'light':
          this.containerClass = 'alert alert-bg-light';
          break;
        default:
          this.containerClass = 'alert alert-bg-secondary';
      }
    }
  }
}