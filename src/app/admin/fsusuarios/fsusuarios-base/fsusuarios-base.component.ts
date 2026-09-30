import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup, FormControl } from '@angular/forms';
import { startWith } from 'rxjs/operators';

// DIPS
import { dipsAnimations } from '../../../../@dips/animations';
import { DipsSidebarService } from 'src/@dips/components/sidebar/sidebar.service';

// Datos
import { UsuariosDatasource } from '../../../firebase/datos/usuarios';
import { UsuariosDatabase } from '../../../firebase/datos/usuarios/usuarios.database';

// Material
import { MatPaginator } from '@angular/material/paginator';
import { MatDialog } from '@angular/material/dialog';

// Componentes
import { FsusuarioFormDialogComponent } from '../fsusuarios-form/fsusuarios-form.component';


@Component({
  selector: 'fsusuarios-base',
  templateUrl: './fsusuarios-base.component.html',
  styleUrls: ['./fsusuarios-base.component.scss'],
  animations   : dipsAnimations,
  encapsulation: ViewEncapsulation.None,
  providers: [UsuariosDatasource]
})

export class FsusuarioBaseComponent implements OnInit {

  // Formulario de Busqueda
  buscaGroup!: FormGroup;
  buscar!: FormControl;

  dialogoRef: any;    // para el dialogo que se despliega

  @ViewChild('paginator', { static: true }) paginator!: MatPaginator;
  
  constructor(
        public source: UsuariosDatasource,
        private database: UsuariosDatabase,
        private _formBuilder: FormBuilder,  
        private _dipsSidebarService: DipsSidebarService,
        public _matDialog: MatDialog
     
      ) { }

  ngOnInit() {

    // this.inicializaForm();

    this.source.setPaginator(this.paginator);

    // // Busqueda
    // this.source.addStream({
    //    name: 'usuarios.busca',
    //    stream: this.buscaGroup.valueChanges.pipe(startWith(this.buscar))
    //  });

  }

  // /**
  //  * inicializaForm
  //  * 
  //  */
  // inicializaForm(){
  //   this.buscaGroup = new FormGroup({
  //     buscar: new FormControl()
  //   });

  //   if (this.buscaGroup){
  //     this.buscaGroup.reset();
  //   }
  //   this.buscaGroup = this._formBuilder.group({
  //     buscar: ""

  //   });

  // }


  toggleSidebar(nombre: any): void
  {
      this._dipsSidebarService.getSidebar(nombre).toggleOpen();
  }

}

