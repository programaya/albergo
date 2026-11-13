import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

// COMPONENTES
import { RegistroComponent } from './registro.component';

const routes: Routes = [
  {
    path: 'listado',
    component: RegistroComponent,

  },
  { path: '', redirectTo: 'listado', pathMatch: 'full' }

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class RegistroRoutingModule { }

