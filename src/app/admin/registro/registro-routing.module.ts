import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

// COMPONENTES
import { RegistroBaseComponent } from './registro-base/registro-base.component';

const routes: Routes = [
  {
    path: 'listado',
    component: RegistroBaseComponent,

  }

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class RegistroRoutingModule { }

