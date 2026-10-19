import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

// COMPONENTES
import { CajaBaseComponent } from './caja-base/caja-base.component';
import { CajaFormComponent } from './caja-form/caja-form.component';


const routes: Routes = [
  {
    path     : 'listado',
    component: CajaBaseComponent,
    
  },
  
  {
    path     : 'form/:id',
    component:  CajaFormComponent,

  },

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CajaRoutingModule { }

