import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';

// DIPS
import { dipsAnimations } from '../../../../@dips/animations';

// Datos
import { CajasDatasource } from '../../../firebase/datos/cajas';
import { CajasDatabase } from '../../../firebase/datos/cajas/cajas.database';

import { FormBuilder, FormGroup, FormControl } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';

import { startWith } from 'rxjs/operators'; 

@Component({
  selector: 'caja-base',
  templateUrl: './caja-base.component.html',
  styleUrls: ['./caja-base.component.scss'],
  animations   : dipsAnimations,
  encapsulation: ViewEncapsulation.None,
  providers: [CajasDatasource]
})

export class CajaBaseComponent implements OnInit {

  // Formulario de Busqueda
  buscaGroup!: FormGroup;
  buscar!: FormControl;

  @ViewChild('paginator', { static: true }) paginator!: MatPaginator;

  constructor(
        public source: CajasDatasource,
        private database: CajasDatabase,
        private _formBuilder: FormBuilder,        
      ) { }

  ngOnInit() {

    this.inicializaForm();

    this.source.setPaginator(this.paginator);

    // Busqueda
    this.source.addStream({
       name: 'cajas.busca',
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

