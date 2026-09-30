import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup, FormControl } from '@angular/forms';
import { startWith } from 'rxjs/operators';

// DIPS
import { dipsAnimations } from '../../../../@dips/animations';
import { DipsSidebarService } from 'src/@dips/components/sidebar/sidebar.service';

// Datos
import { HabitacionesDatasource } from '../../../firebase/datos/habitaciones';
import { HabitacionesDatabase } from '../../../firebase/datos/habitaciones/habitaciones.database';

// Material
import { MatPaginator } from '@angular/material/paginator';
import { MatDialog } from '@angular/material/dialog';

// Componentes
import { TableroFormDialogComponent } from '../tablero-form/tablero-form.component';


@Component({
  selector: 'tablero-base',
  templateUrl: './tablero-base.component.html',
  styleUrls: ['./tablero-base.component.scss'],
  animations   : dipsAnimations,
  encapsulation: ViewEncapsulation.None,
  providers: [HabitacionesDatasource]
})

export class TableroBaseComponent implements OnInit {

  // Formulario de Busqueda
  buscaGroup!: FormGroup;
  buscar!: FormControl;

  dialogoRef: any;    // para el dialogo que se despliega

  @ViewChild('paginator', { static: true }) paginator!: MatPaginator;
  
  constructor(
        public source: HabitacionesDatasource,
        private database: HabitacionesDatabase,
        private _formBuilder: FormBuilder,  
        private _dipsSidebarService: DipsSidebarService,
        public _matDialog: MatDialog
     
      ) { }

  ngOnInit() {

    this.inicializaForm();

    this.source.setPaginator(this.paginator);

    // Busqueda
    this.source.addStream({
       name: 'habitaciones.busca',
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
  
}

