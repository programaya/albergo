import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { SesionGuard } from '../../sesion/sesion.guard';    

// COMPONENTES
import { FsusuarioBaseComponent } from './fsusuarios-base/fsusuarios-base.component';

const routes: Routes = [
  {
    path: 'listado',
    component: FsusuarioBaseComponent,
    canActivateChild: [SesionGuard]
  }

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class FsusuarioRoutingModule { }

