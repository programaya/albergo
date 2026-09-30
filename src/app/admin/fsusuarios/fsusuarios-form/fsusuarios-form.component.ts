import { Component, Inject, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

import { Usuarios } from '../../../sesion/cuenta.model';

@Component({
    selector     : 'fsusuarios-form-dialog',
    templateUrl  : './fsusuarios-form.component.html',
    styleUrls    : ['./fsusuarios-form.component.scss'],
    encapsulation: ViewEncapsulation.None
})

export class FsusuarioFormDialogComponent
{
    estado: string;
    dato: Usuarios;
    datoForm!: FormGroup;
    dialogoTitulo: string;

    constructor(
        public matDialogRef: MatDialogRef<FsusuarioFormDialogComponent>,
        @Inject(MAT_DIALOG_DATA) private _data: any,
        private _formBuilder: FormBuilder
    )
    {
        // Set the defaults
        this.estado = _data.estado;

        this.dialogoTitulo = 'Editando Usuarios';
        this.dato = _data.dato;

        this.inicializaForm();
        this.creaForm();
    }

    inicializaForm(){
        this.datoForm = new FormGroup({
            tipoEncargado: new FormControl(),
            titulo: new FormControl(),
        });
    }

    creaForm(){

        if (this.datoForm){
            this.datoForm.reset();
          }
      
          this.datoForm = this._formBuilder.group({
            tipoEncargado: [this.dato.tipoEncargado],  
            titulo: [this.dato.titulo], 

          })
    }

}
