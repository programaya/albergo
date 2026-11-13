import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { SesionGuard } from './../sesion/sesion.guard';

// Modulos
import { TableroModule } from './tablero/tablero.module';
import { ArqueoModule } from './caja/arqueo/arqueo.module';

const routes = [
  {
    path: 'tablero',
    loadChildren: () => { return TableroModule },
    //    canActivate: [SesionGuard],
  },

  {
    path: 'arqueo',
    loadChildren: () => { return ArqueoModule },
    //    canActivate: [SesionGuard],
  },

  {
    path: '**',
    loadChildren: () => { return TableroModule },
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PrincipalRoutingModule { }
