import { Component, Inject, ViewEncapsulation } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
    selector   : 'dips-atencion-dialog',
    templateUrl: './atencion-dialog.component.html',
    styleUrls  : ['./atencion-dialog.component.scss'],
    encapsulation: ViewEncapsulation.None

})
export class DipsAtencionDialogComponent
{

    titulo: '';
    tituloColor: undefined;

    linea1: '';
    linea2: '';
    linea3: '';

    icon: undefined;
    opcion: false;

    botonAceptar: string;
    botonCancela: string;

//   titulo: '';
//   icon: undefined;
//   iconColor: undefined;

//   text: undefined;
//   options: false;
//   input: false;
//   button: undefined;
//   inputData: '';

 
    /**
     * Constructor
     */
    constructor(
        public matdialogRef: MatDialogRef<DipsAtencionDialogComponent>,
        @Inject(MAT_DIALOG_DATA) private _dato: any,
        ) 
    {

        this.titulo      = this._dato.titulo;
        this.tituloColor = this._dato.tituloColor;

        this.linea1 = this._dato.linea1;
        this.linea2 = this._dato.linea2;
        this.linea3 = this._dato.linea3;

        this.opcion = this._dato.opcion;

        this.botonAceptar = this._dato.botonAceptar;
        this.botonCancela = this._dato.botonCancela;

        //     this.icon = data.icon;
//     this.iconColor = data.iconColor;
//     this.text = data.text;
//     this.options = data.options;
//     this.input = data.input;
//     this.button = data.button;

//     if (data.time) {
//       setTimeout(() => {
//         this.dialogRef.close();
//       }, data.time);
//     }
    }

}

// FORMA DE ACTIVARLO

// this.atencionDialogoRef = this._matDialog.open(DipsAtencionDialogComponent, {
//     panelClass: 'atencion-dialog',
//     disableClose: true,
//     data      : {
//         titulo: 'Es un Titulo',
//         linea1: 'lina 1',
//         linea2: 'linea 2',
//         linea3: 'linea 3',
//         botonAceptar: 'Aceptar',
//         botonCancela: 'Cancela'
//     }

// });


