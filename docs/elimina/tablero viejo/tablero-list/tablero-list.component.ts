import { PerformanceMonitoringService } from '@angular/fire/compat/performance';
import { NavigationStart } from '@angular/router';
import { Component, Input, OnDestroy, OnInit, TemplateRef, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormGroup, Validator } from '@angular/forms';

// Material
import { MatSort } from '@angular/material/sort';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';

// RXJS
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { dipsAnimations } from  '../../../../@dips/animations';
import { DipsConfirmDialogComponent } from '../../../../@dips/components/confirm-dialog/confirm-dialog.component';

import { TableroFormDialogComponent } from '../tablero-form/tablero-form.component';

// Datos
//import { HabitacionesDatasource } from '../../../firebase/datos/habitaciones';
import { HabitacionesDatabase } from '../../../firebase/datos/habitaciones/habitaciones.database';
import { MovimientosDatabase } from '../../../firebase/datos/movimientos/movimientos.database';
import { CajFlujosDatabase } from 'src/app/firebase/datos/cajFlujos';
import { CajasDatabase } from 'src/app/firebase/datos/cajas';
import { Cajas } from 'src/app/firebase/datos/cajas';

//import { albergoParametro } from 'src/@dips/services/parametro/parametro.model';
import { FireBDService } from '../../../firebase/servicios/firebase.service';
import { Sensor } from '../../../firebase/servicios/firebase.model';

// Parametros
import { DipsParametroService } from 'src/@dips/services/parametro/parametro.service';
import { DipsUsuarioService } from 'src/@dips/services/usuario.service';
import { DatePipe } from '@angular/common';

@Component({
    selector     : 'tablero-list',
    templateUrl  : './tablero-list.component.html',
    styleUrls    : ['./tablero-list.component.scss'],
    encapsulation: ViewEncapsulation.None,
    animations   : dipsAnimations
})
export class TableroListComponent implements OnInit, OnDestroy {
 //   @Input() source!: HabitacionesDatasource;
    @Input() source!: Sensor[] | undefined;
    @Input() displayedColumns = ['servicios', 'nombre', 'entrada', 'salida', 'donde'];
  
    // @ViewChild('sort', {static: true}) sort!: MatSort;

//    checkboxes: {};
    dialogoRef: any;
    // confirmaDialogoRef!: MatDialogRef<DipsConfirmDialogComponent>;

    // Private
    private _unsubscribeAll: Subject<any>;
    fbDatos: any;
    datosSensor: any;
    notificacion: any;
    parametros: any;
    habitacion: any;
    usuario: any;
    caja: any;

//    Dato: Sensor[] | undefined;

    constructor(
//        private _habitacionesDatabase: HabitacionesDatabase,
        private _dipsUsuarioService: DipsUsuarioService,
        private _habitacionDB: HabitacionesDatabase,
        private _cajFlujosDB: CajFlujosDatabase,
        private _cajaDB: CajasDatabase,
//        private _movimientosDB: MovimientosDatabase,
        private _parametrosService: DipsParametroService,
        private _fbService: FireBDService,
        private _matSnackBar: MatSnackBar,
        private _matDialog: MatDialog
    )
    {
        // Datos de Usuario
        this._dipsUsuarioService.getUsuario()
            .subscribe((usuario: any) => {
                this.usuario = usuario;
            });

        // Set the private defaults
         this._unsubscribeAll = new Subject();
            
    }

//     // -----------------------------------------------------------------------------------------------------
//     // @ Lifecycle hooks
//     // -----------------------------------------------------------------------------------------------------

    /**
     * On init
     */
    ngOnInit() {
//        this.notificacion = new Audio('src/assets/sonidos/notificacion.mp3');

        // Datos desde firebase
        let s = this._fbService.getAll(); 

        // Llamamos los datos desde Firebase e iteramos los datos con data.ForEach y por
        // último pasamos los datos a JSON
    
        s.snapshotChanges()
        .pipe(takeUntil(this._unsubscribeAll))
        .subscribe(data => { 
            this.source = [];
            data.forEach(item => {
                let a = item.payload.toJSON(); 
                console.log("json");
                console.log(a)
                this.source!.push(a as Sensor);
            })
            // Orden por nombre
            this.source!.sort( function (a, b) {
                if (a.nombre > b.nombre) {
                    return 1
                }
                if (a.nombre < b.nombre) {
                    return -1
                }
                // igual retorna 0
                return 0;
            })
        })

    }

    /**
     * On destroy
     */
    ngOnDestroy(): void {

        // Unsubscribe from all subscriptions
        this._unsubscribeAll.next();
        this._unsubscribeAll.complete();
    }

    seleccionColor(fila: any) {

        switch (fila.estAviso){
            case "a": {
                //            this.notificacion.play();
                //  let audio: HTMLAudioElement = new Audio('https://drive.google.com/uc?export=download&id=1M95VOpto1cQ4FQHzNBaLf0WFQglrtWi7');
                //      audio.play();
                return "#FDE768"
            }

            case "p": {
                return "#FAAC5F"
            }

            case "g": {
                return "#FA6F63"
            }
        }

        if (fila.ocupada) {
            return "#87C6FA"             
        }

        if (fila.estado == "A") {
           return "#BAFA89" 
        }

        return 
    }
//     // -----------------------------------------------------------------------------------------------------
//     // @ Public methods
//     // -----------------------------------------------------------------------------------------------------

//     /**
//      * Edit contact
//      *
//      * @param contact
//      */
    editaItem(fila: any) {

        // Datos de Parametros    
        this._parametrosService.getParametros().subscribe((parametro: any) => {
            this.parametros = parametro;
        })

        // Datos de Habitacion
        this._habitacionDB.simple(fila.uid).subscribe((res: any) => {
            this.habitacion = res.payload.data()
        })





//         this._fbService.lee(fila.id)
//             .pipe(takeUntil(this._unsubscribeAll))
//             .subscribe((respuesta: any) => {this.datosSensor = respuesta})

        this.dialogoRef = this._matDialog.open(TableroFormDialogComponent, {
            panelClass: 'tablero-form-dialog',
            data      : {
                dato: fila,
//                accion : 'editar'
            }
        });

        // Datos de caja
        this._cajaDB.simple(this.parametros.uidCaja).subscribe((caja: any) => {
            this.caja = caja.payload.data();
        })

        this.dialogoRef.afterClosed()
            .subscribe((respuesta: any) => {

                if ( !respuesta ) {return}

                const actionType: string = respuesta[0];
                const formData: FormGroup = respuesta[1];

                const data = formData.getRawValue();

                switch ( actionType ) {

                    case 'pagar':

                        console.log("accion PAGAR")
                        this.verificaPago(fila, data)

                        if (this.verificaPago(fila, data)) {

                            this.salvaAlojamiento(fila, data, actionType)

                        } else {
                            let mensaje = this._matSnackBar.open("Habitación aún No Cancelada", 'OK', {
                                                        verticalPosition: 'top',
                                                        duration        : 6000,
                                                    });

                            mensaje.afterDismissed().subscribe(()=> {return})
                        }

                        break

                    case 'alojar':

                        console.log("accion ALOJAR")
                        this.verificaPago(fila, data)

                        data.ocupada = true;
                        this.salvaAlojamiento(fila, data, actionType)

                        break;
                        
                    case 'cerrar':

                        console.log("accion CERRAR")

                        if (fila.cuarto) {
                            // habitacion aun ocupada    
                            let mensaje = this._matSnackBar.open("Habitación aún Ocupada", 'OK', {
                                                        verticalPosition: 'top',
                                                        duration        : 6000,
                                                    });

                            mensaje.afterDismissed().subscribe(()=> {return})

                        } else if (fila.garage) {
                                // Garage aun ocupada    
                                let mensaje = this._matSnackBar.open("Cochera aún Ocupada", 'OK', {
                                                            verticalPosition: 'top',
                                                            duration        : 6000,
                                                        });
    
                                mensaje.afterDismissed().subscribe(()=> {return})
    
                        } else {

                            if (!this.verificaPago(fila, data)) {

                                let mensaje = this._matSnackBar.open("Habitación aún No Cancelada", 'OK', {
                                                            verticalPosition: 'top',
                                                            duration        : 6000,
                                                        });

                                mensaje.afterDismissed().subscribe(()=> {return})

                            } else {   // Desocupa Habitacion
                        
                                this.salvaAlojamiento(fila, data, actionType)

                                data.ocupada = false; // ocupar

                                data.estado = "A";
                                data.estAviso = "";
                                data.horaInicio = Date.now();
                                data.horaFin = 0;
                                data.promoNombre = ''
                                data.promoUID = '0'
                                data.precio = 0
                                data.estadia = 0
                                data.abonado = 0
                                data.nota = ""

                                this._fbService.actualiza(fila.uid, data);
                            }
                        }

                        break;

                    case 'limpia':
                        console.log("accion LIMPIA")

                        // // Salva movimiento
                        // const datosMovimiento = {
                        //     nombre: fila.nombre,
                        //     horaInicio: fila.horaInicio,
                        //     horaFin: Date.now(),
                        //     estado: "A",
                        //     usuario: this.usuario.email,
                        //     uidUsuario: this.usuario.uid
                        // }
                        // this._movimientosDB.ingresaDato(datosMovimiento)

                        // Libera habitacion
                        data.estado = "L";
                        data.horaInicio = 0;
                        this._fbService.actualiza(fila.uid, data);

                        break;

                    case 'cancel':
                        console.log("accion CANCELAR")
                       break;
                }
            });
    }

    verificaPago(fila: any, dato: any){   

        if (dato.abonado > 0) {
            if (dato.precio > dato.abonado) {
                let mensaje = this._matSnackBar.open("Habitación aún No Cancelada. El pago no será tomado en cuenta", 'OK', {
                    verticalPosition: 'top',
                    duration        : 6000,
                });

                mensaje.afterDismissed().subscribe(()=> {return})

                return false

            } else {
                return true
            }

        } else {
            return false
        }
    }

    salvaAlojamiento(fila: any, data: any, accion: any){

        // ingreso de importe
        if ( data.abonado < data.precio ){
            data.abonado = 0
        } else {
            data.abonado = data.precio
        }


        if ( accion == 'cerrar') {  // Cierre de habitacion

            // Analisis de Nota
            let detalle = ""

            // fuera de turno
            if (fila.estAviso == "g"){
                detalle = "Fuera de Turno"  
            } 

            // nota escrita
            if (fila.nota != '') { detalle = fila.nota } // antes
            if (data.nota != '') { detalle = data.nota } // ahora

            // salva en Caja
            this.salvaCaja(fila, data, detalle)
            this.asientaMovimiento(fila, detalle)

        }


        this._fbService.actualiza(fila.uid, data);

    }

    salvaCaja(fila: any, data: any, detalle: any) {

        this.caja.ingresos += data.abonado
        this.caja.saldo += data.abonado

        const datosCaja = {
            fecha: Date.now(),
            horaInicio: fila.horaInicio,
            horaFin: fila.horaFin,
            habitacion: fila.nombre,
            promo: data.promoNombre,
            promoUID: data.promoUID,
            detalle: detalle,
            importe: data.abonado,
            saldo: this.caja.saldo,
            usuario: this.usuario.email,
            uidUsuario: this.usuario.uid,

        }

        this.caja.resumen.push(datosCaja)
        this._cajaDB.actualizaDato(this.parametros.uidCaja, this.caja)
    }

    asientaMovimiento(fila: any, detalle: any) {

        // const datosMovimiento = {
        //     nombre: fila.nombre,
        //     horaInicio: fila.horaInicio,
        //     horaFin: fila.horaFin,
        //     estadia: fila.estadia,
        //     estado: fila.estado,
        //     precio: fila.precio,   
        //     promoNombre: fila.promoNombre,
        //     promoUID: fila.promoUID,
        //     nota: detalle,
        //     usuario: this.usuario.email,
        //     uidUsuario: this.usuario.uid
        // }

        // this._movimientosDB.ingresaDato(datosMovimiento)
    }

    verificaEstaPagada(fila: any){

        // ingreso de importe
        if (fila.estado == "A") { return false }

        let valor = fila.precio 

        if (fila.estAviso == "g") {
            valor *= 2;
        }

        if ( fila.abonado == valor ){
            return true
        } else {
            return false
        }

    }

    dondeEstan(fila: any){
        if (fila.estAviso != ""){
            if (fila.cuarto) {
                return 1
            } else if (fila.garage) {
                return 2
            }
        }
        return 0
    }

}
