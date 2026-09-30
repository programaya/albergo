import { Component, OnDestroy, OnInit, Pipe } from '@angular/core';
import { FormBuilder, FormGroup, FormControl } from '@angular/forms';

import { startWith } from 'rxjs/operators';

// Datos
import { RegistroDatasource } from 'src/app/firebase/datos/registros';

@Component({
    selector   : 'registro-sidebar',
    templateUrl: './registro-sidebars.component.html',
    styleUrls  : ['./registro-sidebars.component.scss']
})
export class RegistroSidebarComponent implements OnInit {

    // Filtro Formulario
    registrofiltroGroupSidebar!: FormGroup;
    filtro!: FormControl;

    filtradoPor!: string;
 
    constructor(
        public dataSource: RegistroDatasource,
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
        this.registrofiltroGroupSidebar = new FormGroup({
            filtro: new FormControl()
          });
      
          this.registrofiltroGroupSidebar = this._formBuilder.group({
            filtro: ""
          });

        // Filtrar
        this.dataSource.addStream({
            name: 'registro.filtro',     // nombre del filtro que se utiliza
            stream: this.registrofiltroGroupSidebar.valueChanges.pipe(startWith(this.filtro))
        });
    }


    cambiaFiltro(filtro: any) {
        this.filtradoPor = filtro;   // permite que se vea cual es la seleccion

            /* ACA AGREGAR ALGUNA FUNCION QUE GENERE EL TIPO DE FILTRO QUE SE 
            DESEA SEGUN EL PARAMETRO FILTRO RECIBIDO */

            switch ( filtro ) {

                case 'todo':
                    this.registrofiltroGroupSidebar.controls['filtro'].setValue("");
                    break;

                case 'Turner':
                    this.registrofiltroGroupSidebar.controls['filtro'].setValue("Turner");
                   break;

                case 'Beer':
                    this.registrofiltroGroupSidebar.controls['filtro'].setValue("Beer");
                   break;
            }

 
    }
}
