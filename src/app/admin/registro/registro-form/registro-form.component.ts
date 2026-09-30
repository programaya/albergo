import { Component, OnInit, OnDestroy, Inject, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup, FormControl } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

//RXJS
import { Subject } from 'rxjs';
import { takeUntil, take } from 'rxjs/operators';

@Component({
    selector     : 'registro-form-dialog',
    templateUrl  : './registro-form.component.html',
    styleUrls    : ['./registro-form.component.scss'],
    encapsulation: ViewEncapsulation.None
})

export class RegistroFormDialogComponent implements OnInit, OnDestroy{

    // Variables Globales
    id: any;

    accion: string;
//!    dato!: Sensor;

    datoForm!: FormGroup;
    dialogoTitulo!: string;

    private _unsubscribeAll: Subject<any>;

    constructor(
        public matDialogRef: MatDialogRef<RegistroFormDialogComponent>,
        @Inject(MAT_DIALOG_DATA) private _data: any,
        private _formBuilder: FormBuilder,
//        private _registrocionesDatabase: RegistrocionesDatabase,
//        private _promocionesDatabase: PromocionesDatabase,
    ) {
        // Set the defaults
        this.accion = _data.accion;

//        if ( this.accion === 'editar' ) {
            this.dialogoTitulo = 'Editando Registrocion';
 //!           this.dato = _data.dato;
            this.id = _data.dato.id;

            
//        } else {
            // this.dialogoTitulo = 'Nueva Registrocion';
            // this.dato = new Registrociones({});
            // this.id = "";
//        }

        this._unsubscribeAll = new Subject();

        this.inicializaForm();

        this.creaForm();


    }

    inicializaForm(){
        this.datoForm = new FormGroup({
//            nombre: new FormControl(null, { asyncValidators: existeNombre(this._registrocionesDatabase, this.id), updateOn:'blur'}),
            nombre: new FormControl(null),
            valor: new FormControl(null),
            promo: new FormControl(null),
        });
    }

    creaForm(){

        if (this.datoForm){
            this.datoForm.reset();
        }
      
// !         this.datoForm = this._formBuilder.group({
//         nombre: [this.dato.nombre],
//         valor: [this.dato.valor],
// //        promo: [this.dato.promo],

//         })

    }

    ngOnInit() {

    }

    // trae formulario para visualizar
    //! get f(){
    //!     return this.datoForm.controls;
    //! }


    ngOnDestroy() {
        // Unsubscribe from all subscriptions
        this._unsubscribeAll.next();
        this._unsubscribeAll.complete();
    }

}
