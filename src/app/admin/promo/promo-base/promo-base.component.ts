import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup, FormControl } from '@angular/forms';
import { startWith } from 'rxjs/operators';

// DIPS
import { dipsAnimations } from '../../../../@dips/animations';
import { DipsSidebarService } from 'src/@dips/components/sidebar/sidebar.service';

// Datos
import { PromocionesDatasource } from '../../../firebase/datos/promociones';
import { PromocionesDatabase } from '../../../firebase/datos/promociones/promociones.database';
import { Promociones } from '../../../firebase/datos/promociones/promociones.model';

// Habitaciones
import { HabitacionesDatabase } from '../../../firebase/datos/habitaciones/habitaciones.database';
import { Habitaciones } from '../../../firebase/datos/habitaciones/habitaciones.model';

// Material
import { MatPaginator } from '@angular/material/paginator';
import { MatDialog } from '@angular/material/dialog';

// Componentes
import { PromoFormDialogComponent } from '../promo-form/promo-form.component';

//RXJS
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { FireBDService } from 'src/app/firebase/servicios/firebase.service';

@Component({
  selector: 'promo-base',
  templateUrl: './promo-base.component.html',
  styleUrls: ['./promo-base.component.scss'],
  animations   : dipsAnimations,
  encapsulation: ViewEncapsulation.None,
  providers: [PromocionesDatasource]
})

export class PromoBaseComponent implements OnInit {

  // Formulario de Busqueda
  buscaGroup!: FormGroup;
  buscar!: FormControl;

  dialogoRef: any;    // para el dialogo que se despliega

  datosPromo: Array<Promociones> = [];

  private _flagHabitaLectura: boolean = false;
  private _flagPromosLectura: boolean = false;


  // Private
  private _unsubscribeAll: Subject<any>;

  @ViewChild('paginator', { static: true }) paginator!: MatPaginator;
  
  constructor(
        public source: PromocionesDatasource,
        private _promoDB: PromocionesDatabase,
        private _fireDBservice: FireBDService, 
        private _habitaDB: HabitacionesDatabase,
        private _formBuilder: FormBuilder,  
        private _dipsSidebarService: DipsSidebarService,
        public _matDialog: MatDialog
     
      ) {
          // Set the private defaults
          this._unsubscribeAll = new Subject();
        }

  ngOnInit() {

    this.inicializaForm();

    this.source.setPaginator(this.paginator);

    // Busqueda
    this.source.addStream({
       name: 'promociones.busca',
       stream: this.buscaGroup.valueChanges.pipe(startWith(this.buscar))
     });

  }

  /**
   * inicializaForm
   * 
   */
  inicializaForm(){
    this.buscaGroup = new FormGroup({
      buscar: new FormControl()
    });

    if (this.buscaGroup){
      this.buscaGroup.reset();
    }
    this.buscaGroup = this._formBuilder.group({
      buscar: ""

    });

  }

  /**
   * nuevoItem
   * 
   *  permite el ingreso directo de un nuevo dato desde la base
   */
  nuevoItem() {

      this.dialogoRef = this._matDialog.open(PromoFormDialogComponent, {
        panelClass: 'promo-form-dialog',
        data: {
          accion: 'nuevo'
        }
      });

      this.dialogoRef.afterClosed()
          .subscribe((response: FormGroup) => {
              if ( !response ) {
                  return;
              }

              // inicializa flag que garantizan que solo se haga 1 vez
              this._flagHabitaLectura = false;
              this._flagPromosLectura = false;

              const data = response.getRawValue();
              
              // generacion de claves de busqueda
              data.claves = this._promoDB.generaClaves(data.semana, data.horas)

              this._promoDB.ingresaDato(data).then((res) => {

                data.uid = res.id
                this._promoDB.actualizaDato(res.id, data);

              });

              this.actualizaPromos();
          });
  }

  toggleSidebar(nombre: any): void
  {
      this._dipsSidebarService.getSidebar(nombre).toggleOpen();
  }

  actualizaPromos(){

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

  }

}

