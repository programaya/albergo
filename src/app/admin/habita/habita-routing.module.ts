import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

// COMPONENTES
import { HabitaBaseComponent } from './habita-base/habita-base.component';

const routes: Routes = [
  {
    path: 'listado',
    component: HabitaBaseComponent,

  }

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class HabitaRoutingModule { }

