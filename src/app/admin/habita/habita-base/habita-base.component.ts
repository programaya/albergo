import { Component, OnInit, OnDestroy, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup, FormControl } from '@angular/forms';
import { startWith, map } from 'rxjs/operators';

// DIPS
import { dipsAnimations } from '../../../../@dips/animations';
import { DipsSidebarService } from 'src/@dips/components/sidebar/sidebar.service';
import { DipsUsuarioService } from 'src/@dips/services/usuario.service';

// Datos
import { HabitacionesDatasource } from '../../../firebase/datos/habitaciones';
import { HabitacionesDatabase } from '../../../firebase/datos/habitaciones/habitaciones.database';
//!import { Sensor } from '../../../firebase/servicios/firebase.model';
import { FireBDService } from '../../../firebase/servicios/firebase.service';

// Promociones
import { PromocionesDatabase } from '../../../firebase/datos/promociones/promociones.database';
import { Promociones } from '../../../firebase/datos/promociones/promociones.model';

// Material
import { MatPaginator } from '@angular/material/paginator';
import { MatDialog } from '@angular/material/dialog';

// Componentes
import { HabitaFormDialogComponent } from '../habita-form/habita-form.component';

//RXJS
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';


@Component({
  selector: 'habita-base',
  templateUrl: './habita-base.component.html',
  styleUrls: ['./habita-base.component.scss'],
  animations   : dipsAnimations,
  encapsulation: ViewEncapsulation.None,
  providers: [HabitacionesDatasource]
})

export class HabitaBaseComponent implements OnInit, OnDestroy {

  // Formulario de Busqueda
  buscaGroup!: FormGroup;
  buscar!: FormControl;

  dialogoRef: any;    // para el dialogo que se despliega

  //!fbDatos: Sensor;
  usuario: any;

  datosPromo: Array<Promociones> = [];
  flagHabita: number = 0;

  // Private
  private _unsubscribeAll: Subject<any>;

  @ViewChild('paginator', { static: true }) paginator!: MatPaginator;
  
  constructor(
        public source: HabitacionesDatasource,
        private _habitaDB: HabitacionesDatabase,
        private _promoDB: PromocionesDatabase,
        private _fbService: FireBDService,
        private _dipsUsuarioService: DipsUsuarioService,
        private _formBuilder: FormBuilder,  
        private _dipsSidebarService: DipsSidebarService,
        public _matDialog: MatDialog
     
      ) { 
        // Datos de Usuario
        this._dipsUsuarioService.getUsuario()
          .subscribe((usuario: any) => {
              this.usuario = usuario;

          });
      
        //! this.fbDatos = new Sensor();

        // Set the private defaults
        this._unsubscribeAll = new Subject();

      }

  ngOnInit() {

    this._promoDB.leeTodo().then(
        ref => {
            ref.pipe(takeUntil(this._unsubscribeAll)).subscribe(res => { 
                this.datosPromo = []
                res.map( datoPromo => {
                  this.datosPromo.push(datoPromo.payload.doc.data())
                })
            })   

        }) 

    this.inicializaForm();

    this.source.setPaginator(this.paginator);

    // Busqueda
    this.source.addStream({
       name: 'habitaciones.busca',
       stream: this.buscaGroup.valueChanges.pipe(startWith(this.buscar))
     });

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

      this.dialogoRef = this._matDialog.open(HabitaFormDialogComponent, {
        panelClass: 'habita-form-dialog',
        data: {
          accion: 'nuevo'
        }
      });

      this.dialogoRef.afterClosed()
          .subscribe((response: FormGroup) => {
              if ( !response ) {
                  return;
              }

              const data = response.getRawValue();
              
              data.busca = data.nombre.toLowerCase();
              data.sensorCuarto = "";
              data.sensorGarage = "";
              data.ocupada = false;
              data.horaInicio = 0;
              data.horaFin = 0;
              data.promos = this.datosPromo;
              data.nombrePromo = "";
              data.uidPromo = '';
              data.importe = 0;
              data.estadia = 0;
              data.abonado = 0;
              data.ingreso = 0;

              data.estado = "L";

              data.flagAviso = false;
              data.flagGracia = false;
              data.flagPeriodo = false;
              data.nota = "";
              data.usuario = ""
              data.uidUsuario = ""

              // this._habitaDB.ingresaDato(data).then((res) => {

              //   data.uid = res.id
              //   this._habitaDB.actualizaDato(res.id, data)


              //   // this.fbDatos.uid = res.id
              //   // this.fbDatos.nombre = data.nombre

              //   // this._fbService.crear(this.fbDatos.uid, this.fbDatos)

              // });

          });
  }

}

