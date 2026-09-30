import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

// Layout dips
import { TranslateModule } from '@ngx-translate/core';
import { DipsSharedModule } from '../../@dips/shared.module';

// Material
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';

import { SesionRoutingModule } from './sesion-routing.module';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { MailConfirmComponent } from './mail-confirmacion/mail-confirm.component'
import { ResetPasswordComponent } from './reset/reset-password.component'
import { ForgotPasswordComponent } from './olvido/forgot-password.component'
import { PerfilModule } from './perfil/perfil.module';

@NgModule({
  declarations: [
    LoginComponent, 
    RegisterComponent, 
    MailConfirmComponent,
    ResetPasswordComponent,
    ForgotPasswordComponent
  ],
  imports: [
    CommonModule,

    // layout dips
    TranslateModule,
    DipsSharedModule,

    // Material
    MatButtonModule,
    MatCheckboxModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,

    SesionRoutingModule,
    PerfilModule
  ]
})
export class SesionModule { }

