import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SesionGuard } from './sesion/sesion.guard';   

// Modulos
import { PrincipalModule } from './principal/principal.module';
import { AdminModule } from './admin/admin.module';
import { SesionModule } from './sesion/sesion.module';

const routes: Routes = [
  {
    path: 'principal',
    loadChildren: () => {return PrincipalModule},
//    canActivate: [SesionGuard]
  },


  {
   path: 'admin',
   loadChildren: () => {return AdminModule},
//   canActivate: [SesionGuard]
    
  },

  {
    path: 'sesion',
    loadChildren: () => {return SesionModule},
  },

  {
    path: '',
    redirectTo: 'sesion/login',
    pathMatch: 'full',
//    canActivate: [SesionGuard] 
  },
  {
    path      : '**',
    redirectTo: 'principal/tablero',                         
//    pathMatch: 'full',
//    canActivate: [SesionGuard] 
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, {
    initialNavigation: 'enabled'
})],
  exports: [RouterModule]
})
export class AppRoutingModule { }
