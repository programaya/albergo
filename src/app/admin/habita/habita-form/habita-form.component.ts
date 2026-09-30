import { Component, OnInit, OnDestroy, Inject, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup, FormControl } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

import { TablaItemUnido } from 'src/app/firebase/servicios/firebase.model';

//RXJS
import { Subject } from 'rxjs';

@Component({
    selector     : 'habita-form-dialog',
    templateUrl  : './habita-form.component.html',
    styleUrls    : ['./habita-form.component.scss'],
    encapsulation: ViewEncapsulation.None
})

export class HabitaFormDialogComponent implements OnInit, OnDestroy{

    // Variables Globales
    id: any;

    accion: string;
    dato!: TablaItemUnido;

    datoForm!: FormGroup;
    dialogoTitulo!: string;

    private _unsubscribeAll: Subject<any>;

    constructor(
        public matDialogRef: MatDialogRef<HabitaFormDialogComponent>,
        @Inject(MAT_DIALOG_DATA) private _data: any,
        private _formBuilder: FormBuilder,

    ) {
        // Set the defaults
        this.accion = _data.accion;

            this.dialogoTitulo = 'Editando Habitacion';
            this.dato = _data.dato;
            this.id = _data.dato.id;

        this._unsubscribeAll = new Subject();

        this.inicializaForm();

        this.creaForm();


    }

    inicializaForm(){
        this.datoForm = new FormGroup({
//            nombre: new FormControl(null, { asyncValidators: existeNombre(this._habitacionesDatabase, this.id), updateOn:'blur'}),
            nombre: new FormControl(null),
            valor: new FormControl(null),
//            promo: new FormControl(null),
        });
    }

    creaForm(){

        if (this.datoForm){
            this.datoForm.reset();
        }
      
        this.datoForm = this._formBuilder.group({
            nombre: [this.dato.nombre],
            valor: [this.dato.valor],
    //        promo: [this.dato.promo],

        })

    }

    ngOnInit() {

    }

    // trae formulario para visualizar
    get f(){
        return this.datoForm.controls;
    }


    ngOnDestroy() {
        // Unsubscribe from all subscriptions
        this._unsubscribeAll.next();
        this._unsubscribeAll.complete();
    }

}
