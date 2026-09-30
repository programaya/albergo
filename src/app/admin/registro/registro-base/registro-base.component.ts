import { Component, OnInit, OnDestroy, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup, FormControl } from '@angular/forms';
import { startWith, map } from 'rxjs/operators';

// DIPS
import { dipsAnimations } from '../../../../@dips/animations';
import { DipsSidebarService } from 'src/@dips/components/sidebar/sidebar.service';
import { DipsUsuarioService } from 'src/@dips/services/usuario.service';

// Datos
import { RegistroDatasource } from 'src/app/firebase/datos/registros';
import { RegistroDatabase } from 'src/app/firebase/datos/registros';


// Promociones
import { PromocionesDatabase } from '../../../firebase/datos/promociones/promociones.database';
import { Promociones } from '../../../firebase/datos/promociones/promociones.model';

// Material
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatDialog } from '@angular/material/dialog';

// Componentes
import { RegistroFormDialogComponent } from '../registro-form/registro-form.component';

//RXJS
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { NodeJsService } from 'src/app/nodejs/servicio/nodejs.service';


@Component({
  selector: 'registro-base',
  templateUrl: './registro-base.component.html',
  styleUrls: ['./registro-base.component.scss'],
  animations   : dipsAnimations,
  encapsulation: ViewEncapsulation.None,
  providers: [RegistroDatasource]
})

export class RegistroBaseComponent implements OnInit, OnDestroy {

  // Formulario de Busqueda
  buscaGroup!: FormGroup;
  buscar!: FormControl;

  dialogoRef: any;    // para el dialogo que se despliega
  usuario: any;

  datosPromo: Array<Promociones> = [];
  flagRegistro: number = 0;

  // Private
  private _unsubscribeAll: Subject<any>;

//  @ViewChild('paginator', { static: true }) paginator!: MatPaginator;
  
  constructor(
//        public source: RegistroDatasource,
        public nodeService: NodeJsService,
        private _registroDB: RegistroDatabase,
        private _promoDB: PromocionesDatabase,
 //       private _fbService: FireBDService,
        private _dipsUsuarioService: DipsUsuarioService,
        private _formBuilder: FormBuilder,  
        private _dipsSidebarService: DipsSidebarService,
        public matDialog: MatDialog
     
      ) { 

        // Set the private defaults
        this._unsubscribeAll = new Subject();

        // Datos de Usuario
        this._dipsUsuarioService.getUsuario()
          .pipe(takeUntil(this._unsubscribeAll))
          .subscribe((usuario: any) => {
              this.usuario = usuario;

          });

      }

  ngOnInit() {

    // this._promoDB.leeTodo().then(
    //     ref => {
    //         ref.pipe(takeUntil(this._unsubscribeAll)).subscribe(res => { 
    //             this.datosPromo = []
    //             res.map( datoPromo => {
    //               this.datosPromo.push(datoPromo.payload.doc.data())
    //             })
    //         })   

    //     }) 

    this.inicializaForm();

//    this.source.setPaginator(this.paginator);

    // Busqueda
    // this.source.addStream({
    //    name: 'registro.busca',
    //    stream: this.buscaGroup.valueChanges.pipe(startWith(this.buscar))
    //  });

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

  handlePageEvent(event: PageEvent) {

    this.nodeService.length    = event.length
    this.nodeService.pageSize  = event.pageSize
    this.nodeService.pageIndex = event.pageIndex

    this.nodeService.leeRegistros(this.usuario.idCuenta)

  }

  /**
   * nuevoItem
   * 
   *  permite el ingreso directo de un nuevo dato desde la base
   */
  nuevoItem() {

      this.dialogoRef = this.matDialog.open(RegistroFormDialogComponent, {
        panelClass: 'registro-form-dialog',
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

              // this._registroDB.ingresaDato(data).then((res) => {

              //   data.uid = res.id
              //   this._registroDB.actualizaDato(res.id, data)


              //   // this.fbDatos.uid = res.id
              //   // this.fbDatos.nombre = data.nombre

              //   // this._fbService.crear(this.fbDatos.uid, this.fbDatos)

              // });

          });
  }

}

