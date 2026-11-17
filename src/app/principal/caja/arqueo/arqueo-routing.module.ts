import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ArqueoComponent } from './arqueo.component';

const routes: Routes = [
    { path: ':id', component: ArqueoComponent },
    { path: '', component: ArqueoComponent }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class ArqueoRoutingModule { }