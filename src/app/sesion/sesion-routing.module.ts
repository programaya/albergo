import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { PerfilComponent } from './perfil/perfil.component';
import { MailConfirmComponent } from './mail-confirmacion/mail-confirm.component';
import { ResetPasswordComponent } from './reset/reset-password.component';
import { ForgotPasswordComponent } from './olvido/forgot-password.component';

import { SesionGuard } from './../sesion/sesion.guard';   

const routes: Routes = [
  {
    path: 'perfil',
    loadChildren: () => import ('./perfil/perfil.module').then(m => m.PerfilModule),
//    canActivate: [SesionGuard]
  },
  
  {
    path:'login',
    component: LoginComponent
  },
  {
    path:'register',
    component: RegisterComponent
  },
  {
    path:'perfil',
    component: PerfilComponent
  },
  {
    path:'confirma',
    component: MailConfirmComponent
  },
  {
    path:'reset',
    component: ResetPasswordComponent
  },
  {
    path:'olvido',
    component: ForgotPasswordComponent
  },
  
  {
    path:'',
    component: LoginComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SesionRoutingModule { }
