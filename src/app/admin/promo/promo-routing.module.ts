import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

// COMPONENTES
import { PromoBaseComponent } from './promo-base/promo-base.component';

const routes: Routes = [
  {
    path: 'listado',
    component: PromoBaseComponent,

  }

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PromoRoutingModule { }

