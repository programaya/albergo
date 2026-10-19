import { USE_DEVICE_LANGUAGE } from '@angular/fire/compat/auth';
import { Component, Inject, ViewEncapsulation, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

import { Cajas } from '../../../firebase/datos/cajas/cajas.model';
import { CajasDatabase } from 'src/app/firebase/datos/cajas';

//RXJS
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
    selector: 'caja-mov-dialog',
    templateUrl: './caja-mov.component.html',
    styleUrls: ['./caja-mov.component.scss'],
    encapsulation: ViewEncapsulation.None
})

export class CajaMovDialogComponent implements OnInit, OnDestroy {
    accion: string;
    dato: Cajas;

    nota: string = "";
    importe: number = 0;


    datoForm!: FormGroup;
    dialogoTitulo: string;

    private _unsubscribeAll: Subject<any>;

    constructor(
        public matDialogRef: MatDialogRef<CajaMovDialogComponent>,
        @Inject(MAT_DIALOG_DATA) private _data: any,
        private _formBuilder: FormBuilder,
        private _cajaDB: CajasDatabase
    ) {

        this.accion = _data.accion;
        this.dato = _data.dato;
        this.dialogoTitulo = 'Movimiento Caja';

        this._unsubscribeAll = new Subject();

    }

    ngOnInit() {

        // this._habitaDB.simple(this.dato.uid)
        //     .pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {

        //         this.habitacion = res.payload.data()
        //         this.creaForm();
        //     })

        this.inicializaForm();

        // Verifica Cambios de Codigo
        // this.datoForm.get('abonado')!.valueChanges
        //     .pipe(takeUntil(this._unsubscribeAll))
        //     .subscribe((monto: any) => {

        //         this.calculoVuelto(monto)

        // });

    }

    ngOnDestroy() {
        // Unsubscribe from all subscriptions
        this._unsubscribeAll.next();
        this._unsubscribeAll.complete();
    }


    inicializaForm() {

        this.datoForm = new FormGroup({
            importe: new FormControl(),
            nota: new FormControl(),
        });

        this.creaForm();
    }

    creaForm() {

        // // Armado de Listado de PROMOS
        // this.listPromo = []     // limpia listado

        // const sinValor = { uid: '0', nombre: "- sin Promo -" }
        // this.listPromo.push(sinValor)   // primera promo SIN PROMO

        // let hoy = new Date();
        // let filtro = hoy.getDay() + '-' + hoy.getHours()

        this.datoForm = this._formBuilder.group({
            importe: [this.importe],
            nota: [this.nota],
        })

    }



    // calculoImporte(promo: any) {

    //     console.log("CALCULO DE IMPORTE")
    //     console.log(promo)


    //     if (promo != '0' && promo != undefined) {

    //         let encontrada = this.listPromo.find((elemento: any) => elemento.uid == promo);

    //         if (encontrada.importe > 0){
    //             this.precio = encontrada.importe

    //             this.dato.promoNombre = encontrada.nombre
    //             this.dato.promoUID = encontrada.uid 
                
    //             this.dato.estadia = (encontrada.permanencia > 0)? encontrada.permanencia: this.habitacion?.estadia

    //             this.datoForm.controls['promoNombre'].setValue(this.dato.promoNombre)
    //             this.datoForm.controls['promoUID'].setValue(this.dato.promoUID)
    //             this.datoForm.controls['estadia'].setValue(this.dato.estadia)

    //         } else {
    //             this.precio = this.habitacion?.importe
    //         }

    //     } else {
    //         this.precio = this.habitacion?.importe;
    //         // this.dato.importe = this.dato.valor
    //     }


    //     if (this.dato.estAviso == "g") {
    //         this.precio *= 2;
    //     }

    //     this.datoForm.controls['precio'].setValue(this.precio)

    // }


    // // calculoVuelto(monto: any) {
    // //     this.datoForm.controls['vuelto'].setValue((monto > 0)? monto - this.precio: 0)
    // // }

    // calculoPagada() {

    //     let importe = this.dato.precio
    //     if (this.dato.estAviso == "g"){
    //         importe *= 2
    //     }

    //     if (importe == 0 || 
    //         importe > this.dato.abonado) {
    //         return false
    //     } else {
    //         return true
    //     }

    // }

    // cierrePagado() {

    //     if (this.accion == 'limpia') {
    //         return true
    //     }

    //     return this.calculoPagada()

    //     // if (this.accion == 'cerrar') {
    //     //     return this.calculoPagada()
    //     // } else {
    //     //     return false
    //     // }
    // }

    // cierrePromo() {

    //     if (this.accion == 'limpia') {
    //         return false
    //     }   
    //     // } else if (this.dato.estAviso != "") {
    //     //     return false

    //     // } else if (this.accion == 'cerrar') {
    //         if (this.dato.abonado > 0) {
    //             return false;
    //         } else {
    //             return true;
    //         }   

    //     // } else {
    //     //     return true
    //     // }
    // }

}
