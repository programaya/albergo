import { Component, Input, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';

// Material
import { MatSort } from '@angular/material/sort';
//import { MatCajator } from '@angular/material/paginator';

// DIPS
import { dipsAnimations } from '../../../../@dips/animations';
//import { DipsUtils } from 'src/@dips/utils';

// Cajas
import { CajasDatasource } from '../../../firebase/datos/cajas';

@Component({
    selector     : 'caja-list',
    templateUrl  : './caja-list.component.html',
    styleUrls    : ['./caja-list.component.scss'],
    animations   : dipsAnimations,
    encapsulation: ViewEncapsulation.None,
})
export class CajaListComponent implements OnInit {
  @Input() source!: CajasDatasource;
  @Input() displayedColumns = ['fecha', 'encargado', 'ingresos', 'egresos', 'saldo'];

  @ViewChild('sort', {static: true}) sort!: MatSort;

  constructor() {}

  ngOnInit() {
    this.source.setSort(this.sort);

  }

}