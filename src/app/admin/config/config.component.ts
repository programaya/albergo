import { Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { Location } from '@angular/common';

import { Subject, Subscription } from 'rxjs';

import { map, takeUntil } from 'rxjs/operators';

// Parametros
import { DipsParametroService } from 'src/@dips/services/parametro/parametro.service';

// Material
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';

// DIPS
import { dipsAnimations } from '../../../@dips/animations';
import { DipsConfirmDialogComponent } from '../../../@dips/components/confirm-dialog/confirm-dialog.component';

// firebase
import { albergoParametro } from 'src/@dips/services/parametro/parametro.model';
import { FireBDService } from 'src/app/firebase/servicios/firebase.service';


interface Sensibilidades {
  value: number;
  nombre: string;
}


@Component({
  selector: 'config-form',
  templateUrl: './config.component.html',
  styleUrls: ['./config.component.scss'],
  encapsulation: ViewEncapsulation.None,
  animations   : dipsAnimations

})
export class ConfigFormComponent implements OnInit, OnDestroy {

  // Variables Globales
  id: any;
  dato: albergoParametro;
  item: any;
  pagTipo!: string;

  datoForm!: FormGroup;
  sensiForm!: FormGroup;

  private _unsubscribeAll: Subject<any>;
  private _comandos!: Subscription;

  confirmaBorrado!: MatDialogRef<DipsConfirmDialogComponent>;

  sensibilidades: Sensibilidades[] = [
    {value: 1500, nombre: 'Alta'},
    {value: 3000, nombre: 'Normal'},
    {value: 5000, nombre: 'Media'},
    {value: 7000, nombre: 'Baja'},

  ];

  constructor(
        private _route: ActivatedRoute,
        private _formBuilder: FormBuilder,
        private _matSnackBar: MatSnackBar,
        private _matDialog: MatDialog,
        private _fireService: FireBDService,
        private _location: Location
      ) {

        // Configuracion por defecto
        this.dato = new albergoParametro();

        this._unsubscribeAll = new Subject();

  }

  // -----------------------------------------------------------------------------------------------------
  // @ Ciclo de Vida
  // -----------------------------------------------------------------------------------------------------

  ngOnInit() {

    // asigna valor de id
    this.id = this._route.snapshot.params.id;

    this.inicializaForm();

    this._fireService.leeParametros()
                      ?.pipe(takeUntil(this._unsubscribeAll))
                      .subscribe((parametro) => {
                          console.log("LEE PARAMETROS", parametro)
                          this.dato = new albergoParametro(parametro);
                          this.pagTipo = 'edita';

                          this.construyeForm();
                       
                      })
    
  }

  ngOnDestroy() {
      // Unsubscribe from all subscriptions
      this._unsubscribeAll.next();
      this._unsubscribeAll.complete();

  }

  // -----------------------------------------------------------------------------------------------------
  // @ Public methods
  // -----------------------------------------------------------------------------------------------------

  inicializaForm(){
    this.datoForm = new FormGroup({

      sensibilidadCuarto: new FormControl(null),
      sensibilidadGarage: new FormControl(null),

      // Tiempos
      tiempoCuartoOn:  new FormControl(null),
      tiempoCuartoOff: new FormControl(null),
      tiempoGarageOn:  new FormControl(null),    
      tiempoGarageOff: new FormControl(null), 
  
      tiempoStandard: new FormControl(null), 
      tiempoAviso:    new FormControl(null), 
      tiempoGracia:   new FormControl(null), 

      tiempoLimpieza: new FormControl(null),
      tiempoSucia:    new FormControl(null)
    });

  }


  construyeForm(){

    if (this.datoForm){
      this.datoForm.reset();
    }

    this.datoForm = this._formBuilder.group({
      sensibilidadCuarto: [this.dato.sensibilidadCuarto],
      sensibilidadGarage: [this.dato.sensibilidadGarage],

      // Tiempos
      tiempoCuartoOn:   [this.dato.tiempoCuartoOn],
      tiempoGarageOn:   [this.dato.tiempoGarageOn],    
  
      tiempoStandard:   [this.dato.tiempoStandard], 
      tiempoAviso:      [this.dato.tiempoAviso], 
      tiempoGracia:     [this.dato.tiempoGracia], 

      tiempoLimpieza:   [this.dato.tiempoLimpieza],
      tiempoSucia:      [this.dato.tiempoSucia]
    })

  }
  
  /**
   * salvaDato
   * 
   */
  salvaDato() {
    const data = this.datoForm.getRawValue();

    console.log("SALIDA ", data)

    //this._parametrosDatabase.actualizaDato(this.id, data);
    this._fireService.actualizaParametros(data);

    // comando reset
    const comando = {
      cmdCuarto: "reset",
      cmdGarage: "reset"
    }

    //! this._comandos = this._fireService.getAll().stateChanges().pipe(
    //     map(changes => {
    //           this._fireService.actualizaComandos(changes.key, comando);
    //         }
    //     )).subscribe();

    // Muestra mensaje de realizado
    let mensaje = this._matSnackBar.open('Datos Salvados', 'OK', {
                                              verticalPosition: 'top',
                                              duration        : 2000,
                                            });

    // al cerrar mensaje vuelve a pagina anterior
    mensaje.afterDismissed().subscribe(()=> {
            this._comandos.unsubscribe();
            this.retornaPagAnterior()
          })
  }
  
  retornaPagAnterior(){
    this._location.back();
  }

}

