import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

// COMPONENTES
import { ConfigFormComponent } from './config/config.component';

import { SesionGuard } from './../sesion/sesion.guard';   

// Modulos
import { HabitaModule } from './habita/habita.module';
import { PromoModule } from './promo/promo.module';
import { FsusuariosModule } from './fsusuarios/fsusuarios.module';
import { RegistroModule } from './registro/registro.module';

const routes: Routes = [
  {
    path: 'registro',
    loadChildren: () => {return RegistroModule},

  },
  
  {
    path: 'habita',
    loadChildren: () => {return HabitaModule},
    // canActivate: [SesionGuard]
  },

  {
    path: 'promo',
    loadChildren: () => {return PromoModule},
    // canActivate: [SesionGuard]
  },

  {
    path: 'fsusuarios',
    loadChildren: () => {return FsusuariosModule},
    // canActivate: [SesionGuard]
  },

  {
    path     : 'config/:id',
    component: ConfigFormComponent,
    
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminRoutingModule { }
