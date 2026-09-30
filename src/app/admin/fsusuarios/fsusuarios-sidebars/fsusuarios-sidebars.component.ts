import { Component, OnDestroy, OnInit, Pipe } from '@angular/core';
import { FormBuilder, FormGroup, FormControl } from '@angular/forms';

import { startWith } from 'rxjs/operators';

// Datos
import { UsuariosDatasource } from '../../../firebase/datos/usuarios';

@Component({
    selector   : 'fsusuarios-sidebar',
    templateUrl: './fsusuarios-sidebars.component.html',
    styleUrls  : ['./fsusuarios-sidebars.component.scss']
})
export class FsusuarioSidebarComponent implements OnInit {

    // Filtro Formulario
    fsusuariofiltroGroupSidebar!: FormGroup;
    filtro!: FormControl;

    filtradoPor!: string;
 
    constructor(
        public dataSource: UsuariosDatasource,
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
        this.fsusuariofiltroGroupSidebar = new FormGroup({
            filtro: new FormControl()
          });
      
          this.fsusuariofiltroGroupSidebar = this._formBuilder.group({
            filtro: ""
          });

        // Filtrar
        this.dataSource.addStream({
            name: 'usuarios.filtro',     // nombre del filtro que se utiliza
            stream: this.fsusuariofiltroGroupSidebar.valueChanges.pipe(startWith(this.filtro))
        });
    }


    cambiaFiltro(filtro: any) {
        this.filtradoPor = filtro;   // permite que se vea cual es la seleccion
        
            // TODO
            /* ACA AGREGAR ALGUNA FUNCION QUE GENERE EL TIPO DE FILTRO QUE SE 
            DESEA SEGUN EL PARAMETRO FILTRO RECIBIDO */

            switch ( filtro ) {

                case 'todo':
                    this.fsusuariofiltroGroupSidebar.controls['filtro'].setValue("");
                    break;

                case 'Encargados':
                    this.fsusuariofiltroGroupSidebar.controls['filtro'].setValue("Turner");
                   break;

                case 'Administrador':
                    this.fsusuariofiltroGroupSidebar.controls['filtro'].setValue("Beer");
                   break;
            }

 
    }
}
