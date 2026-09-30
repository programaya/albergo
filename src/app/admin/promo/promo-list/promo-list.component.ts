import { Component, Input, OnDestroy, OnInit, TemplateRef, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormGroup } from '@angular/forms';

// Material
import { MatSort } from '@angular/material/sort';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';

import { dipsAnimations } from  '../../../../@dips/animations';
import { DipsConfirmDialogComponent } from '../../../../@dips/components/confirm-dialog/confirm-dialog.component';

import { PromoFormDialogComponent } from '../promo-form/promo-form.component';

// Datos
import { PromocionesDatasource } from '../../../firebase/datos/promociones';
import { PromocionesDatabase } from '../../../firebase/datos/promociones/promociones.database';
import { Promociones } from '../../../firebase/datos/promociones/promociones.model';


//RXJS
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { HabitacionesDatabase } from 'src/app/firebase/datos/habitaciones';

@Component({
    selector     : 'promo-list',
    templateUrl  : './promo-list.component.html',
    styleUrls    : ['./promo-list.component.scss'],
    encapsulation: ViewEncapsulation.None,
    animations   : dipsAnimations
})
export class PromoListComponent implements OnInit, OnDestroy {
    @Input() source!: PromocionesDatasource;
    @Input() displayedColumns = ['nombre', 'tiempo', 'precio'];
 
    @ViewChild('sort', {static: true}) sort!: MatSort;

    dialogoRef: any;
    confirmaDialogoRef!: MatDialogRef<DipsConfirmDialogComponent> | null;

    datosPromo: Array<Promociones> = [];
    flagHabita: number = 0;

    private _flagHabitaLectura: boolean = false;
    private _flagPromosLectura: boolean = false;
  

    // Private
    private _unsubscribeAll: Subject<any>;
  

    constructor(
        private _promoDB: PromocionesDatabase,
        private _habitaDB: HabitacionesDatabase,
        public _matDialog: MatDialog
    )
    {
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
        this.source.setSort(this.sort);

        // lee todas las promos y arma array
        this._promoDB.leeTodo().then(
            ref => {
                ref.pipe(takeUntil(this._unsubscribeAll)).subscribe(res => { 

                    this.datosPromo = []
                    res.map( datoPromo => {
                        this.datosPromo.push(datoPromo.payload.doc.data())
                    })
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

         this.dialogoRef = this._matDialog.open(PromoFormDialogComponent, {
            panelClass: 'promo-form-dialog',
            data      : {
                dato: fila,
                accion : 'editar'
            }
        });

        this.dialogoRef.afterClosed()
            .subscribe((response: any) => {
                if ( !response )
                {
                    return;
                }
                const actionType: string = response[0];
                const formData: FormGroup = response[1];

                // inicializa flag que garantizan que solo se haga 1 vez
                this._flagHabitaLectura = false;
                this._flagPromosLectura = false;

                switch ( actionType ) {

                    case 'save':
                        const data = formData.getRawValue();

                        // generacion de claves de busqueda
                        data.claves = this._promoDB.generaClaves(data.semana, data.horas)

                        this._promoDB.actualizaDato(fila.id, data) 

                        this.flagHabita = 0;
                        this.actualizaPromos();

                        break;

                    case 'delete':

                       this.borraItem(fila);
                       
                       this.flagHabita = 0;
                       this.actualizaPromos();

                       break;
                }
            });
    }

    borraItem(fila: any): void
    {
        this.confirmaDialogoRef = this._matDialog.open(DipsConfirmDialogComponent, {
            disableClose: false
        });

        this.confirmaDialogoRef.componentInstance.confirmMessage = 'Está seguro que quiere borrar?';

        this.confirmaDialogoRef.afterClosed().subscribe(result => {
            if ( result )
            {
                this._promoDB.borraDato(fila.id);
            }
            this.confirmaDialogoRef = null;
        });

    }

    actualizaPromos(){

        // lee todas las promos y 
        this._promoDB.leeTodo().then(
          ref => {
              ref.pipe(takeUntil(this._unsubscribeAll)).subscribe(res => { 

                console.log("RESPUESTA", res)

                    this.datosPromo = []
                    res.map( datoPromo => {
                        this.datosPromo.push(datoPromo.payload.doc.data())
                    })



                // lee todas las promo arma un array que coloca en todas las habitaciones    
                this._promoDB.leeTodo().then(
                    ref => {
                        ref.pipe(takeUntil(this._unsubscribeAll)).subscribe(res => { 
                            this.datosPromo = []
                        
                            res.map( datoPromo => {
                                this.datosPromo.push(datoPromo.payload.doc.data())
                            })
                        
                            if (!this._flagPromosLectura) {
                            this._flagPromosLectura = true;
                            }
                        
                            this._habitaDB.leeTodo().then(
                            ref => {
                                ref.pipe(takeUntil(this._unsubscribeAll)).subscribe(res => { 
            
                                    if (!this._flagHabitaLectura && this._flagPromosLectura) {
                                        this._flagHabitaLectura = true
                                        res.map( habitacion => {
                                        const datosHabita = habitacion.payload.doc.data()
                                        datosHabita.promos = this.datosPromo
            
                                        this._habitaDB.actualizaDato(habitacion.payload.doc.id, datosHabita)
            
                                        })
            
                                    }
                                })   
                    
                            }) 
                        
                        })   
                        
                }) 


            })   
    
        }) 
    

    
    }
}
