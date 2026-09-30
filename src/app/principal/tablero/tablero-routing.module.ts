import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

// COMPONENTES
import { TableroBaseComponent } from './tablero-base/tablero-base.component';

const routes: Routes = [
  {
    path: 'listado',
    component: TableroBaseComponent,

  },
  {
    path: '**',
    component: TableroBaseComponent,

  }


];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TableroRoutingModule { }

