import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { DipsConfigService } from '../../../@dips/services/config.service';
import { dipsAnimations } from '../../../@dips/animations';

import { AutentificacionService } from '../autentificacion.service';

// rutas
import { Router } from '@angular/router';

// Multi-idiomas
import { DipsTranslationLoaderService } from 'src/@dips/services/translation-loader.service';
import { locale as espanol } from './../i18n/es'; // importar todos los idiomas que se utilicen

@Component({
    selector     : 'forgot-password',
    templateUrl  : './forgot-password.component.html',
    styleUrls    : ['./forgot-password.component.scss'],
    encapsulation: ViewEncapsulation.None,
    animations   : dipsAnimations
})
export class ForgotPasswordComponent implements OnInit
{
    forgotPasswordForm!: FormGroup;

    errorOlvido: any;

    /**
     * Constructor
     */
    constructor(
        private _dipsConfigService: DipsConfigService,
        private _formBuilder: FormBuilder,
        private _authService: AutentificacionService,
        private _traductor: DipsTranslationLoaderService,
        private _router: Router
  
    )
    {
        // Configure the layout
        this._dipsConfigService.config = {
            layout: {
                navbar   : {
                    hidden: true
                },
                toolbar  : {
                    hidden: true
                },
                footer   : {
                    hidden: true
                },
                sidepanel: {
                    hidden: true
                }
            }
        };

        // Multi-idiomas
        this.errorOlvido = 'VACIO';
        this._traductor.loadTranslations(espanol); // ejemplo this._translationLoader.loadTranslations(espanol, turkish);


    }

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    /**
     * On init
     */
    ngOnInit(): void
    {
        this.forgotPasswordForm = this._formBuilder.group({
            email: ['', [Validators.required, Validators.email]]
        });
    }

    // trae formulario para visualizar
    get f(){
        return this.forgotPasswordForm.controls;
    }

    async haceReset(valor: any) {

        this.errorOlvido = '';
    
        await this._authService.resetPassword(valor.email);
    
        switch (this._authService.errorAuth) {
          case '': {  // no error
            this.errorOlvido = 'VACIO';
            this._authService.confirmaEmail = valor.email;
            this._router.navigate(['sesion/confirma']);
            break;
    
          }
          case undefined: {// no error
            this.errorOlvido = 'VACIO';
            this._authService.confirmaEmail = valor.email;
            this._router.navigate(['sesion/confirma']);
            break;

          }
          case 'auth/invalid-email': {
            this.errorOlvido = 'INVALID-EMAIL';
            break
          } 
          case 'auth/missing-android-pkg-name': {
            this.errorOlvido = 'MISSING-ANDROID-PKG-NAME';
            break
          } 
          case 'auth/missing-continue-uri': {
            this.errorOlvido = 'MISSING-CONTINUE-URI';
            break
          } 
          case 'auth/missing-ios-bundle-id': {
            this.errorOlvido = 'MISSING-IOS-BUNDLE-ID';
            break
          } 
          case 'auth/invalid-continue-uri': {
            this.errorOlvido = 'INVALID-CONTINUE-URI';
            break
          } 
          case 'auth/unauthorized-continue-uri': {
            this.errorOlvido = 'UNAUTHORIZED-CONTINUE-URI';
            break
          } 
          case 'auth/user-not-found': {
            this.errorOlvido = 'USER-NOT-FOUND';
            break
          } 

          default:{
            this.errorOlvido = 'CONEXION';
    
            break
          }



    
        }
    
      }    
}
