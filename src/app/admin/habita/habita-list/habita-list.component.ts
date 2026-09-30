import { Component, Input, OnDestroy, OnInit, TemplateRef, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormGroup } from '@angular/forms';

// Material
import { MatSort } from '@angular/material/sort';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';


import { dipsAnimations } from  '../../../../@dips/animations';
import { DipsConfirmDialogComponent } from '../../../../@dips/components/confirm-dialog/confirm-dialog.component';

import { HabitaFormDialogComponent } from '../habita-form/habita-form.component';

// Datos
import { Habitaciones, HabitacionesDatasource } from '../../../firebase/datos/habitaciones';
import { HabitacionesDatabase } from '../../../firebase/datos/habitaciones/habitaciones.database';

import { TablaDatos } from 'src/app/firebase/servicios/firebase.model';
import { FireBDService } from '../../../firebase/servicios/firebase.service';

// Promociones
import { PromocionesDatabase } from '../../../firebase/datos/promociones/promociones.database';
import { Promociones } from '../../../firebase/datos/promociones/promociones.model';

import { DipsUsuarioService } from 'src/@dips/services/usuario.service';

//RXJS
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
    selector     : 'habita-list',
    templateUrl  : './habita-list.component.html',
    styleUrls    : ['./habita-list.component.scss'],
    encapsulation: ViewEncapsulation.None,
    animations   : dipsAnimations
})
export class HabitaListComponent implements OnInit, OnDestroy {
//    @Input() source!: HabitacionesDatasource;

    @Input() source!: TablaDatos[] | undefined
    @Input() displayedColumns = ['nombre', 'importe'];
    
    @ViewChild('sort', {static: true}) sort!: MatSort;

    dialogoRef: any;
    confirmaDialogoRef!: MatDialogRef<DipsConfirmDialogComponent> | null;

    fbDatos: any;
    usuario: any;

    datosPromo: Array<Promociones> = [];

    // Private
   private _unsubscribeAll: Subject<any>;

    constructor(
 //       private _habitacionesDatabase: HabitacionesDatabase,
        private _promoDB: PromocionesDatabase,
        private _fbService: FireBDService,
        private _habitaDB: HabitacionesDatabase,
        private _dipsUsuarioService: DipsUsuarioService,
        public _matDialog: MatDialog
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

    /**
     * On init
     */
    ngOnInit() {

        // Datos desde firebase
        let s = this._fbService.traerTablaDatos()

        // Llamamos los datos desde Firebase e iteramos los datos con data.ForEach y por
        // se pasan a json por último ordenamos alfabeticamente
        s.snapshotChanges()
         .pipe(takeUntil(this._unsubscribeAll))
         .subscribe(data => {

                this.source = [];
                data.forEach(item => {
                    let a = item.payload.toJSON(); 
                    this.source!.push(a as TablaDatos);
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

        // this.source.setSort(this.sort);
        
        // this._promoDB.leeTodo().then(
        //     ref => {
        //         ref.pipe(takeUntil(this._unsubscribeAll)).subscribe(res => { 
        //             this.datosPromo = []
        //             res.map( datoPromo => {
        //                 this.datosPromo.push(datoPromo.payload.doc.data())
        //             })
        //         })   
        //     }) 
            
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


//     /**
//      * Edit contact
//      *
//      * @param contact
//      */
    editaItem(fila: any) {

        this.dialogoRef = this._matDialog.open(HabitaFormDialogComponent, {
            panelClass: 'habita-form-dialog',
            data      : {
                dato: fila,
                accion : 'editar'
            }
        });

        this.dialogoRef.afterClosed()
            .subscribe((response: any) => {
                if ( !response ) {
                    return;
                }
                const actionType: string = response[0];
                const formData: FormGroup = response[1];

                switch ( actionType ) {

                    case 'save':
                        const data = formData.getRawValue();

                        this._fbService.actualiza(fila.id, data)

                        this._habitaDB.busca(fila.id)
                            .subscribe((info: any) => {

                                if (!info.payload.exists) {

                                    this._promoDB.leeTodo().then(
                                        ref => {
                                            ref.pipe(takeUntil(this._unsubscribeAll)).subscribe(res => { 
                                                    this.datosPromo = []
                                    
                                                    res.map( datoPromo => {
                                                        this.datosPromo.push(datoPromo.payload.doc.data())
                                                    })

                                                    const habita: Habitaciones = {
                                                        uid: fila.id,
                                                        nombre: data.nombre,
                                                        promos: this.datosPromo,

                                                    }

                                                    this._habitaDB.ingresaDato(habita)
                                            })
                                                 
                                        })     


                                }
                                

                        })    
                                
                        break;

                    case 'delete':

//                        this.borraItem(fila);


                       break;
                }
            });
    }

//     borraItem(fila: any): void
//     {
//         this.confirmaDialogoRef = this._matDialog.open(DipsConfirmDialogComponent, {
//             disableClose: false
//         });

//         this.confirmaDialogoRef.componentInstance.confirmMessage = 'Está seguro que quiere borrar?';

//         this.confirmaDialogoRef.afterClosed().subscribe(result => {
//             if ( result ) {
// //                this._habitacionesDatabase.borraDato(fila.id);

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

}
