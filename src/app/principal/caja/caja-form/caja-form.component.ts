import { Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Location } from '@angular/common';

import { Subject } from 'rxjs';

import { takeUntil } from 'rxjs/operators';

// Cajas
import { CajasDatabase } from '../../../firebase/datos/cajas/cajas.database';
import { Cajas } from '../../../firebase/datos/cajas/cajas.model';

// Material
import { MatSnackBar } from '@angular/material/snack-bar';

// MODULO
import { CajaMovDialogComponent } from '../caja-mov/caja-mov.component';

// DIPS
import { dipsAnimations } from '../../../../@dips/animations';
import { DipsConfirmDialogComponent } from '../../../../@dips/components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'caja-form',
  templateUrl: './caja-form.component.html',
  styleUrls: ['./caja-form.component.scss'],
  encapsulation: ViewEncapsulation.None,
  animations   : dipsAnimations

})
export class CajaFormComponent implements OnInit, OnDestroy {

  // Variables Globales
  id: any;
  datoCaja: any;
  //item: any;
  pagTipo!: string;
  //datoForm!: FormGroup;
  detalle: any

  displayedColumns = ['fecha', 'habitacion', 'promo', 'importe', 'saldo', 'detalle'];


  private _unsubscribeAll: Subject<any>;

  dialogoRef: any;
  confirmaDialogoRef!: MatDialogRef<DipsConfirmDialogComponent> | null;
  confirmaBorrado!: MatDialogRef<DipsConfirmDialogComponent> | null;

  constructor(
        private _route: ActivatedRoute,
        private _cajasDatabase: CajasDatabase,
        private _formBuilder: FormBuilder,
        private _matSnackBar: MatSnackBar,
        private _matDialog: MatDialog,
        private _location: Location
      ) {

        // Configuracion por defecto
        this.datoCaja = new Cajas();

        this._unsubscribeAll = new Subject();

  }

  // -----------------------------------------------------------------------------------------------------
  // @ Ciclo de Vida
  // -----------------------------------------------------------------------------------------------------

  ngOnInit() {

    // asigna valor de id
    this.id = this._route.snapshot.params.id;

    this._cajasDatabase.simple(this.id)
                            .pipe(takeUntil(this._unsubscribeAll))
                            .subscribe((item: any) => {

                              if ( item.payload.exists ){  // Dato Existente
                                  this.datoCaja = item.payload.data();
                                  this.pagTipo = 'edita';
                              }

                              else {        // Dato Nuevo
                                  this.pagTipo = 'nuevo';
                                  this.datoCaja = {};
                              }
              
                              this.detalle = this.datoCaja.resumen;

                            });
     
  }

  ngOnDestroy() {
      // Unsubscribe from all subscriptions
      this._unsubscribeAll.next();
      this._unsubscribeAll.complete();
  }

  // -----------------------------------------------------------------------------------------------------
  // @ Public methods
  // -----------------------------------------------------------------------------------------------------

  retornaPagAnterior(){
    this._location.back();
  }

  editaCaja() {

    this.dialogoRef = this._matDialog.open(CajaMovDialogComponent, {
      panelClass: 'caja-mov-dialog',
      data : {
          dato: this.datoCaja,
          accion : 'editar'
      }
    });

    this.dialogoRef.afterClosed()
        .subscribe((respuesta: any) => {

          if ( !respuesta ) { return }

          const actionType: string = respuesta[0];
          const formData: FormGroup = respuesta[1];
          const data = formData.getRawValue();

          if (actionType == "asiento") {

            if (data.importe != 0) {

              if (data.importe > 0) {
                this.datoCaja.ingresos += data.importe
              } else { // importe negativo
                this.datoCaja.egresos += data.importe * (-1)
              }

              this.datoCaja.saldo += data.importe

              const detalleCaja = {
                fecha: Date.now(),
                horaInicio: 0,
                horaFin: 0,
                habitacion: "",
                promo: "",
                promoUID: "",
                detalle: data.nota,
                importe: data.importe,
                saldo: this.datoCaja.saldo,
                usuario: "",
                uidUsuario: "",
              }  

              this.datoCaja.resumen.push(detalleCaja)
              this._cajasDatabase.actualizaDato(this.id, this.datoCaja)
            }
          }

        });
  }


}

