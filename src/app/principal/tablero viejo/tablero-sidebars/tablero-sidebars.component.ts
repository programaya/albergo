import { Component, OnDestroy, OnInit, Pipe } from '@angular/core';
import { FormBuilder, FormGroup, FormControl } from '@angular/forms';

import { startWith } from 'rxjs/operators';

// Datos
import { HabitacionesDatasource } from '../../../firebase/datos/habitaciones';

@Component({
    selector   : 'tablero-sidebar',
    templateUrl: './tablero-sidebars.component.html',
    styleUrls  : ['./tablero-sidebars.component.scss']
})
export class TableroSidebarComponent implements OnInit {

    // Filtro Formulario
    tablerofiltroGroupSidebar!: FormGroup;
    filtro!: FormControl;

    filtradoPor!: string;
 
    constructor(
        public dataSource: HabitacionesDatasource,
        private _formBuilder: FormBuilder,   

    ) { }

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    /**
     * On init
     */
    ngOnInit() {

        this.filtradoPor = 'todo';    // se fija un filtro standar

        // inicializa form
        this.tablerofiltroGroupSidebar = new FormGroup({
            filtro: new FormControl()
          });
      
          this.tablerofiltroGroupSidebar = this._formBuilder.group({
            filtro: ""
          });

        // Filtrar
        this.dataSource.addStream({
            name: 'habitaciones.filtro',     // nombre del filtro que se utiliza
            stream: this.tablerofiltroGroupSidebar.valueChanges.pipe(startWith(this.filtro))
        });
    }


    cambiaFiltro(filtro: any) {
        this.filtradoPor = filtro;   // permite que se vea cual es la seleccion

            /* ACA AGREGAR ALGUNA FUNCION QUE GENERE EL TIPO DE FILTRO QUE SE 
            DESEA SEGUN EL PARAMETRO FILTRO RECIBIDO */

            switch ( filtro ) {

                case 'todo':
                    this.tablerofiltroGroupSidebar.controls['filtro'].setValue("");
                    break;

                case 'Turner':
                    this.tablerofiltroGroupSidebar.controls['filtro'].setValue("Turner");
                   break;

                case 'Beer':
                    this.tablerofiltroGroupSidebar.controls['filtro'].setValue("Beer");
                   break;
            }

 
    }
}
