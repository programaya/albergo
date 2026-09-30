import { Component, OnDestroy, OnInit, Pipe } from '@angular/core';
import { FormBuilder, FormGroup, FormControl } from '@angular/forms';

import { startWith } from 'rxjs/operators';

// Datos
import { PromocionesDatasource } from '../../../firebase/datos/promociones';

@Component({
    selector   : 'promo-sidebar',
    templateUrl: './promo-sidebars.component.html',
    styleUrls  : ['./promo-sidebars.component.scss']
})
export class PromoSidebarComponent implements OnInit {

    // Filtro Formulario
    promofiltroGroupSidebar!: FormGroup;
    filtro!: FormControl;

    filtradoPor!: string;
 
    constructor(
        public dataSource: PromocionesDatasource,
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
        this.promofiltroGroupSidebar = new FormGroup({
            filtro: new FormControl()
          });
      
          this.promofiltroGroupSidebar = this._formBuilder.group({
            filtro: ""
          });

        // Filtrar
        this.dataSource.addStream({
            name: 'promociones.filtro',     // nombre del filtro que se utiliza
            stream: this.promofiltroGroupSidebar.valueChanges.pipe(startWith(this.filtro))
        });
    }


    cambiaFiltro(filtro: any) {
        this.filtradoPor = filtro;   // permite que se vea cual es la seleccion

            /* ACA AGREGAR ALGUNA FUNCION QUE GENERE EL TIPO DE FILTRO QUE SE 
            DESEA SEGUN EL PARAMETRO FILTRO RECIBIDO */

            switch ( filtro ) {

                case 'todo':
                    this.promofiltroGroupSidebar.controls['filtro'].setValue("");
                    break;

                case 'Turner':
                    this.promofiltroGroupSidebar.controls['filtro'].setValue("Turner");
                   break;

                case 'Beer':
                    this.promofiltroGroupSidebar.controls['filtro'].setValue("Beer");
                   break;
            }

 
    }
}
