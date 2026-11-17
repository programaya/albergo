import { PerformanceMonitoringService } from '@angular/fire/compat/performance';
import { NavigationStart } from '@angular/router';
import { Component, Input, OnDestroy, OnInit, TemplateRef, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormGroup, Validator } from '@angular/forms';

// Material
import { MatSort } from '@angular/material/sort';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';

// RXJS
import { Subject, Observable } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { dipsAnimations } from '../../../../@dips/animations';
import { DipsConfirmDialogComponent } from '../../../../@dips/components/confirm-dialog/confirm-dialog.component';

import { TableroFormDialogComponent } from '../tablero-form/tablero-form.component';

// Datos
//import { HabitacionesDatasource } from '../../../firebase/datos/habitaciones';
import { HabitacionesDatabase } from '../../../firebase/datos/habitaciones/habitaciones.database';
import { MovimientosDatabase } from '../../../firebase/datos/movimientos/movimientos.database';
import { CajFlujosDatabase } from 'src/app/firebase/datos/cajFlujos';
import { CajasDatabase } from 'src/app/firebase/datos/cajas';
import { Cajas } from 'src/app/firebase/datos/cajas';
import { ArqueoDatabase } from '../../caja/arqueo/arqueo.database';

//import { albergoParametro } from 'src/@dips/services/parametro/parametro.model';
import { FireBDService } from '../../../firebase/servicios/firebase.service';
import { TablaItemUnido } from '../../../firebase/servicios/firebase.model';

// Parametros
import { DipsParametroService } from 'src/@dips/services/parametro/parametro.service';
import { DipsUsuarioService } from 'src/@dips/services/usuario.service';
import { DatePipe } from '@angular/common';
import { DipsUtils } from 'src/@dips/utils';
import { DipsAtencionDialogComponent } from 'src/@dips/components/atencion-dialog/atencion-dialog.component';
import { RegistroDatabase } from 'src/app/firebase/datos/registros';
import { NodeJsService } from 'src/app/nodejs/servicio/nodejs.service';
//import { albergoParametro } from 'src/@dips/services/parametro/parametro.model';

@Component({
    selector: 'tablero-list',
    templateUrl: './tablero-list.component.html',
    styleUrls: ['./tablero-list.component.scss'],
    encapsulation: ViewEncapsulation.None,
    animations: dipsAnimations
})
export class TableroListComponent implements OnInit, OnDestroy {
    @Input() source!: TablaItemUnido[] | undefined;
    @Input() displayedColumns = ['servicios', 'estado', 'nombre', 'entrada', 'cuarto', 'cochera'];

    //TablaItemsUnidos$?: Observable<TablaItemUnido[]>

    private _datosOcupada: any = {
        id: "",
        pagado: 0,
        periodo: 0,
        promoUID: "",
        automatico: false,
        fueSucia: false,
        fechaInicio: 0,
        fechaFin: 0,
        estado: 0
    }


    dialogoRef: any;
    _dialogoCheckOutRef: any
    confirmaDialogoRef!: MatDialogRef<DipsConfirmDialogComponent>;

    // Private
    private _unsubscribeAll: Subject<any>;
    fbDatos: any;
    datosSensor: any;
    notificacion: any;
    parametros: any;
    habitacion: any;
    usuario: any;
    caja: any;

    constructor(
        //        private _habitacionesDatabase: HabitacionesDatabase,
        private _dipsUsuarioService: DipsUsuarioService,
        private _registroDB: RegistroDatabase,
        private _habitacionDB: HabitacionesDatabase,
        private _cajFlujosDB: CajFlujosDatabase,
        private _cajaDB: CajasDatabase,
        private _arqueoDB: ArqueoDatabase,
        private _fbService: FireBDService,
        private _nodeService: NodeJsService,

        private _matSnackBar: MatSnackBar,
        private _matDialog: MatDialog) {
        // Set the private defaults
        this._unsubscribeAll = new Subject();

        // Datos de Usuario
        this._dipsUsuarioService.getUsuario()
            .subscribe((usuario: any) => {
                this.usuario = usuario;
                console.log("USUARIO..................", this.usuario)
            });

        // Datos de Parametros    
        this._fbService.leeParametros()?.
            pipe(takeUntil(this._unsubscribeAll))
            .subscribe((parametro) => {
                console.log("LEE PARAMETROS", parametro)
                this.parametros = parametro

            })



    }

    /**
     * On init
     */
    ngOnInit() {
        this.notificacion = new Audio('src/assets/sonidos/notificacion.mp3');

        // Datos desde firebase
        let s = this._fbService.obtenerItemsUnidos()

        // Llamamos los datos desde Firebase e iteramos los datos con data.ForEach y por
        // último ordenamos alfabeticamente
        s.pipe(takeUntil(this._unsubscribeAll))
         .subscribe(data => {
                console.log("DATOS ", data)
                this.source = [];
                data.forEach(item => {

                    this.source!.push(item as TablaItemUnido)
                })
                
                // Orden por nombre
                this.source!.sort(function (a, b) {
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

    colorEstado(estado: any) {

        switch (estado) {
            case 3: {           // Limpieza
                return "#55c976"   //"#BAFA89"
            }

            case 2: {           // Sucia
                return "#7d54a1" //"#C586FA"
            }

            case 0: {           // Mantenimiento
                return "#336fd6"     //"#87C6FA"
            }
        }

        return
    }

    seleccionColor(fila: any) {

        switch (fila.aviso) {
            case 1: {           // Aviso
                // this.notificacion.play();
                // let audio: HTMLAudioElement = new Audio('https://drive.google.com/uc?export=download&id=1M95VOpto1cQ4FQHzNBaLf0WFQglrtWi7');
                // audio.play();
                return "#FDE768"
            }

            case 2: {           // Periodo
                return "#FAAC5F"
            }

            case 3: {           // Gracia
                return "#FA6F63"
            }
        }

        if (fila.estado == 1) {         //Ocupada
            return "#87C6FA"
        }

        if (fila.valor == 0) {

            return 'lightgrey'
        }

        // if (fila.estado == "L") {
        //    return "#BAFA89" 
        // }

        // if (fila.estado == "S") {
        //     return "#C586FA"
        // }

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

        this.dialogoRef = this._matDialog.open(TableroFormDialogComponent, {
            panelClass: 'tablero-form-dialog',
            data: {
                dato: fila,
                //                accion : 'editar'
            }
        });

        // // Datos de caja
        // this._cajaDB.simple(this.parametros.uidCaja).subscribe((caja: any) => {
        //     this.caja = caja.payload.data();
        // })

        this.dialogoRef.afterClosed()
            .subscribe(async (respuesta: any) => {

                if (!respuesta) { return }

                const actionType: string = respuesta[0];
                const formData: FormGroup = respuesta[1];
                const info: any = respuesta[2]

                const data = formData.getRawValue();

                console.log("ACCION ", actionType)
                console.log("DATOS ", data)
                console.log("FILA ", fila)
                console.log("INFO", info)


                if (actionType == "checkIN" ||
                    actionType == "checkOUT") {

                    const pago = Number(info.pago);
                    if (!Number.isFinite(pago) || pago < 0) {
                        this._matSnackBar.open('El importe del pago no es válido.', 'Cerrar');
                        return;
                    }
                    if (pago > 0) {
                        try {
                            await this._arqueoDB.registrarCobro({
                                fechaInicio: new Date(),
                                fechaFin: new Date(),
                                tipo: 'Cobro',
                                descripcion: `Habitación ${fila.nombre} · ${actionType === 'checkIN' ? 'Ingreso' : (fila.aviso === 0 ? 'Estadía' : 'Salida')}`,
                                monto: pago,
                                usuario: this.usuario.email || '',
                                automatico: !!fila.automatico,
                                fueSucia: !!fila.fueSucia,
                                datos: `${data.moneda}${fila.automatico ? '1' : ''}${fila.fueSucia ? '1' : ''}`
                            });
                        } catch (error) {
                            this._matSnackBar.open('No se pudo registrar el cobro en caja. La operación no continuó.', 'Cerrar');
                            return;
                        }
                    }

                    // Datos relevantes de habitacion Ocupada
                    this._datosOcupada.id = fila.id
                    this._datosOcupada.pagado = (actionType === 'checkIN' ? 0 : (Number(fila.pagado) || 0)) + pago
                    this._datosOcupada.periodo = info.periodo * 60000
                    this._datosOcupada.promoUID = data.promoUID

                    this._datosOcupada.fechaInicio = fila.horaInicio
                    this._datosOcupada.fechaFin = Math.floor(Date.now())
                    this._datosOcupada.automatico = fila.automatico
                    this._datosOcupada.fueSucia = fila.fueSucia
                    this._datosOcupada.estado = 1
                // } else {

                //     // Datos relevantes de habitacion Desocupada
                //     this._datosOcupada.id = fila.id
                //     this._datosOcupada.pagado = fila.pagado + info.pago
                //     this._datosOcupada.periodo = info.periodo * 60000
                //     this._datosOcupada.promoUID = data.promoUID

                //     this._datosOcupada.fechaInicio = fila.horaInicio
                //     this._datosOcupada.fechaFin = Math.floor(Date.now() / 1000)
                //     this._datosOcupada.automatico = false
                //     this._datosOcupada.fueSucia = false
                //     this._datosOcupada.estado = "O"
                }


                // SEGUN QUE BOTON SE ACCIONO
                switch (actionType) {

                    case 'boton':

                        // solo para limpieza, suciedad o mantenimiento
                        if (fila.estado == 3 ||     //Limpieza
                            fila.estado == 2 ||     // Sucia
                            fila.estado == 0) {     // Mantenimiento

                            //todo mandar a PHP el cierre de la tarea con la datestamp de cierre
                            const nuevaHab: any = {
                                horaInicio: Math.floor(Date.now()),
                                aviso: 0,
                                cuarto: false,
                                garage: false,
                                periodo: 0                            
                            }    

                            // se actualiza el nuevo estado
                            const nuevoDat: any = {
                                fueSucia: false,
                                automatico: false,
                                pagado: 0,
                                promoUID: ""

                            }

                            if (fila.estado == 3) {
                                nuevaHab.estado = 4  // si termina limpieza pasa a vacia

                            } else if (fila.estado == 2) {
                                nuevaHab.estado = 3  // de sucia pasa a limpieza

                            } else {
                                nuevaHab.estado = 4  // de mantenimiento pasa a vacia 

                            }

                            !this._fbService.actualiza(fila.id, nuevoDat, nuevaHab);

                        }

                        break

                    case 'checkIN':

                        console.log("accion checkIN", data)
                        //    this.verificaPago(fila, data)

                        //todo PHP hacer el cierre de habitacion vacia

                        // data.ocupada = true;
                        this.salvaAlojamiento(fila, data, info)

                        break;

                    case 'checkOUT':

                        this.verificaPago(fila, data, info)

                        break

                }
            });
    }

    verificaPago(fila: any, dato: any, info: any) {

        console.log("FILA", fila)
        console.log("DATO", dato)
        console.log("INFO", info)

        // calculo de pago total
        //const pagado = fila.pagado + info.pago

        if (this._datosOcupada.pagado >= info.precio) {

            if (fila.aviso == 0) {            // aun no es tiempo de salida
                this._salvaPago()
                this._mensajeCheckOut()

            } else {        // ya es tiempo de salida
                this._salvaPago()
                this._hacerCheckOUT();

            }

        } else {

            /**
             * Si no paga todo se asienta los posibles
             * cambios en lo pagado, el periodo de estadia
             * o cambio de la promocion
             */

            this._salvaPago()

        }




    }

    private _salvaSucia(id: any) {

        // const dato = {

        //     //UID: Math.floor(Date.now() / 1000) + id.replace(/\s/g, "").toLowerCase(),
        //     horaInicio: Math.floor(Date.now()),
        //     estado: 2,
        //     aviso: 1,
        //     cuarto: false,
        //     garage: false,
        //     fueSucia: false,
        //     automatico: false,
        //     pagado: 0,
        //     periodo: 0,
        //     promoUID: ""

        // }

        const nuevaHab: any = {
            horaInicio: Math.floor(Date.now()),
            estado: 2,          // sucia
            aviso: 0,
            cuarto: false,
            garage: false,
            periodo: 0,                            
        }    

        const nuevoDat: any = {
            fueSucia: false,
            automatico: false,
            pagado: 0,
            promoUID: ""
        }

        this._fbService.actualiza(id, nuevoDat, nuevaHab)

    }


    salvaAlojamiento(fila: any, data: any, info: any) {

        // Salva datos
        const nuevaHab: any = {
            horaInicio: Math.floor(Date.now()),
            estado: 1,          // Ocupada
            aviso: 0,
            periodo: info.periodo * 60000                            
        }    

        const nuevoDat: any = {
            fueSucia: false,
            automatico: false,
            pagado: Number(info.pago) || 0,
            promoUID: data.promoUID || '',
        }

        this._fbService.actualiza(fila.id, nuevoDat, nuevaHab);

    }

    salvaCaja(fila: any, data: any, detalle: any) {

        // this.caja.ingresos += data.abonado
        // this.caja.saldo += data.abonado

        // const datosCaja = {
        //     fecha: Date.now(),
        //     horaInicio: fila.horaInicio,
        //     horaFin: fila.horaFin,
        //     habitacion: fila.nombre,
        //     promo: data.promoNombre,
        //     promoUID: data.promoUID,
        //     detalle: detalle,
        //     importe: data.abonado,
        //     saldo: this.caja.saldo,
        //     usuario: this.usuario.email,
        //     uidUsuario: this.usuario.uid,

        // }

        // this.caja.resumen.push(datosCaja)
        // this._cajaDB.actualizaDato(this.parametros.uidCaja, this.caja)
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

    dondeEstan(fila: any) {
        // if (fila.estAviso != ""){
        if (fila.cuarto) {
            return 1
        } else if (fila.garage) {
            return 2
        }
        // }
        return 0
    }

    private _mensajeCheckOut() {

        // arma mensaje
        this._dialogoCheckOutRef = this._matDialog.open(DipsAtencionDialogComponent, {
            panelClass: 'atencion-dialog',
            disableClose: true,
            data: {
                titulo: 'Habitación Cancelada',
                linea1: '',
                linea2: 'Desea hacer el CHECK OUT Ahora?',
                linea3: '',
                botonAceptar: 'CHECK OUT',
                botonCancela: 'Aún No'
            }

        });

        // cuando cierra mensaje
        this._dialogoCheckOutRef.afterClosed().subscribe((respuesta: any) => {

            if (respuesta) {
                this._hacerCheckOUT()
            }

        });
    }

    private _salvaPago() {

        // Salva lo datos que han cambiado    
        // const cambio = {

        //     pagado: this._datosOcupada.pagado,
        //     periodo: this._datosOcupada.periodo,
        //     promoUID: this._datosOcupada.promoUID
        // }

        // Salva datos
        const nuevaHab: any = {
            periodo: this._datosOcupada.periodo                            
        }    

        const nuevoDat: any = {
            pagado: this._datosOcupada.pagado,
            promoUID: this._datosOcupada.promoUID
        }

        this._fbService.actualiza(this._datosOcupada.id, nuevoDat, nuevaHab)
    }

    private _hacerCheckOUT() {

        this._salvaRegistro()
        // TODO hace PHP


        this._salvaSucia(this._datosOcupada.id)   // pone la habitacion en sucia

    }

    private _salvaRegistro() {

        let inicio = new Date(this._datosOcupada.fechaInicio)
        let fin    = new Date(Date.now())

        const registro = {
            fechaInicio: this.mysqlFecha(inicio),
            fechaFin: this.mysqlFecha(fin),
            importe: this._datosOcupada.pagado,
            automatico: this._datosOcupada.automatico,
            fueSucia: this._datosOcupada.fueSucia,

            idCuenta: this.usuario.idCuenta,
            idUsuario: this.usuario.uid,
            idHabitacion: this._datosOcupada.id,
            usuario: this.usuario.email,
            estado: this._datosOcupada.estado
        }

        console.log("salva registro", registro)

        this._nodeService.crud("post", "reg", registro)

        this._registroDB.ingresaDato(registro)

    }

    private mysqlFecha (dia: any){

        return [
                    dia.getFullYear(),
                    (dia.getMonth()+1),
                    dia.getDate(),
               ].join('/') +' ' +
               [
                    dia.getHours(),
                    dia.getMinutes(),
                    dia.getSeconds()
               ].join(':');



    }
}

