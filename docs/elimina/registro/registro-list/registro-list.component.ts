import { Component, Input, OnDestroy, OnInit, TemplateRef, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormGroup } from '@angular/forms';

// Material
import { MatSort } from '@angular/material/sort';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';


import { dipsAnimations } from  '../../../../@dips/animations';
import { DipsConfirmDialogComponent } from '../../../../@dips/components/confirm-dialog/confirm-dialog.component';

import { RegistroFormDialogComponent } from '../registro-form/registro-form.component';

// Promociones
import { PromocionesDatabase } from '../../../firebase/datos/promociones/promociones.database';
import { Promociones } from '../../../firebase/datos/promociones/promociones.model';

import { DipsUsuarioService } from 'src/@dips/services/usuario.service';

//RXJS
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { NodeJsService } from 'src/app/nodejs/servicio/nodejs.service';
import { forEach } from 'lodash';

@Component({
    selector     : 'registro-list',
    templateUrl  : './registro-list.component.html',
    styleUrls    : ['./registro-list.component.scss'],
    encapsulation: ViewEncapsulation.None,
    animations   : dipsAnimations
})
export class RegistroListComponent implements OnInit, OnDestroy {
//    @Input() source!: RegistrocionesDatasource;
 //   @Input() source!: RegistroDatabase
    @Input() displayedColumns = ['nombre', 'entrada', 'tiempo', 'importe'];
    
 //   @ViewChild('sort', {static: true}) sort!: MatSort;

    dialogoRef: any;
    confirmaDialogoRef!: MatDialogRef<DipsConfirmDialogComponent> | null;

 //   fbDatos: any;
    usuario: any;
    tabla!: any[]


   // datosPromo: Array<Promociones> = [];

    // Private
   private _unsubscribeAll: Subject<any>;

    constructor(
 //       private _registrocionesDatabase: RegistrocionesDatabase,
        //private _promoDB: PromocionesDatabase,
 //       private _fbService: FireBDService,
 //       private _registroDB: RegistroDatabase,
        private _dipsUsuarioService: DipsUsuarioService,
        public matDialog: MatDialog,
        public nodeService: NodeJsService
    )
    {
      
        // Set the private defaults
       this._unsubscribeAll = new Subject();

        // Datos de Usuario
        this._dipsUsuarioService.getUsuario()
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((usuario: any) => {
                this.usuario = usuario;
            
            })
    

    }

//     // -----------------------------------------------------------------------------------------------------
//     // @ Lifecycle hooks
//     // -----------------------------------------------------------------------------------------------------

    /**
     * On init
     */
    ngOnInit() {

        this.nodeService.leeRegistros(this.usuario.idCuenta)

        this.nodeService.datosTabla
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((resp: any) => {
                console.log("res REGISTROS", resp)
                this.tabla = []



                resp.forEach((item: any) => {
                    let fila = {
                        flag: "a",
                        nombre: item.idHabitacion,
                        entrada: item.fechaInicio,
                        salida: item.fechaFin,
                        tiempo: this.calcularMinutos(item.fechaInicio, item.fechaFin),
                        importe: item.importe

                    }
                    this.tabla.push(fila)

                })


            })  
    }

    /**
     * On destroy
     */
    ngOnDestroy(): void
    {
        // Unsubscribe from all subscriptions
        this._unsubscribeAll.next();
        this._unsubscribeAll.complete();
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

        console.log("FILA", fila)

        this.dialogoRef = this.matDialog.open(RegistroFormDialogComponent, {
            panelClass: 'registro-form-dialog',
            data      : {
                dato: fila,
                accion : 'editar'
            }
        });

//         this.dialogoRef.afterClosed()
//             .subscribe((response: any) => {
//                 if ( !response ) {
//                     return;
//                 }
//                 const actionType: string = response[0];
//                 const formData: FormGroup = response[1];

//                 switch ( actionType ) {

//                     case 'save':
//                         const data = formData.getRawValue();

//                         // generacion de claves de busqueda
//                         // data.busca = data.nombre.toLowerCase();
//                         // data.promos = this.datosPromo;

//                         this._fbService.actualiza(fila.id, data);
//                         // this._fbService.actualiza()
//                         // this._registrocionesDatabase.actualizaDato(fila.id, data);

//                         // this.fbDatos = {
//                         //     nombre: data.nombre,
//                         // }
//                         // this._fbService.actualiza(fila.id, this.fbDatos);


//                         console.log("ID", fila.id)
//                         console.log("DATOS", data)

  
//                         // this._registroDB.busca(fila.id)
//                         //     .subscribe((info: any) => {
                                
//                         //         if (!info.payload.exists) {
//                         //             this._promoDB.leeTodo().then(
//                         //                 ref => {
//                         //                     ref.pipe(takeUntil(this._unsubscribeAll)).subscribe(res => { 
//                         //                             this.datosPromo = []
                                    
//                         //                             res.map( datoPromo => {
//                         //                                 this.datosPromo.push(datoPromo.payload.doc.data())
//                         //                             })

//                         //                             const registro: Registro = {
//                         //                                 uid: fila.id,
//                         //                                 nombre: data.nombre,
//                         //                                 promos: this.datosPromo,

//                         //                             }

//                         //                             this._registroDB.ingresaDato(registro)
//                         //                     })
                                                 
//                         //                 })     
//                         //         }
                                

//                         // })    
                                
 



//                         break;

//                     case 'delete':

// //                        this.borraItem(fila);


//                        break;
//                 }
//             });
    }

//     borraItem(fila: any): void
//     {
//         this.confirmaDialogoRef = this._matDialog.open(DipsConfirmDialogComponent, {
//             disableClose: false
//         });

//         this.confirmaDialogoRef.componentInstance.confirmMessage = 'Está seguro que quiere borrar?';

//         this.confirmaDialogoRef.afterClosed().subscribe(result => {
//             if ( result ) {
// //                this._registrocionesDatabase.borraDato(fila.id);

//                 // actualiza firebase sensor
//                 this.fbDatos = {
//                     cmdCuarto: "borraEEPROM",
//                     cmdGarage: "borraEEPROM",
//                     estado: "ELIMINADA"
//                 }

//                 this._fbService.actualiza(fila.id, this.fbDatos);

//             }
//             this.confirmaDialogoRef = null;
//         });

//     }

    calcularMinutos(fechaIni: any, fechaFin: any) {
        let fecha1 = new Date(
                            fechaIni.substring(0,4),    // año
                            fechaIni.substring(5,7),    // mes
                            fechaIni.substring(8,10),    // dia
                            fechaIni.substring(11,13),  // Hora
                            fechaIni.substring(14,16),  // Minutos
                            fechaIni.substring(17,19),  // Segundos                        
                            fechaFin.substring(20,23)  // Mili Segundos   
                        );

        let fecha2 = new Date(
                            fechaFin.substring(0,4),    // año
                            fechaFin.substring(5,7),    // mes
                            fechaFin.substring(8,10),    // dia
                            fechaFin.substring(11,13),  // Hora
                            fechaFin.substring(14,16),  // Minutos
                            fechaFin.substring(17,19),  // Segundos                        
                            fechaFin.substring(20,23)  // Mili Segundos                        
                        );

        var diasDif = fecha2.getTime() - fecha1.getTime();
        var min = Math.round(diasDif/(1000 * 60));

        return min
 
    }

}
