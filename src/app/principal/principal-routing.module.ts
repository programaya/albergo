import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { SesionGuard } from './../sesion/sesion.guard';   

// Modulos
import { CajaModule } from './caja/caja.module';
import { TableroModule } from './tablero/tablero.module';

const routes = [
  {
    path: 'caja',
    loadChildren: () => {return CajaModule},
//    canActivate: [SesionGuard]
  },

  {
    path: 'tablero',
    loadChildren: () => {return TableroModule},
//    canActivate: [SesionGuard],
  },

  {
    path: '**',
    loadChildren: () => {return TableroModule},
  },  
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PrincipalRoutingModule { }
