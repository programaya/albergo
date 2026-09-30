import { AutentificacionService } from '../autentificacion.service';
import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { DipsConfigService } from '../../../@dips/services/config.service';
import { dipsAnimations } from '../../../@dips/animations';

import { DipsProgressBarService } from 'src/@dips/components/progress-bar/progress-bar.service'

// rutas
import { Router } from '@angular/router';

// Multi-idiomas
import { DipsTranslationLoaderService } from 'src/@dips/services/translation-loader.service';
import { locale as espanol } from './../i18n/es'; // importar todos los idiomas que se utilicen

@Component({
  selector: 'login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  encapsulation: ViewEncapsulation.None,
  animations   : dipsAnimations
})
export class LoginComponent implements OnInit {

    loginForm!: FormGroup;
    errorLogin: any;
//    espera: boolean = false;

    /**
     * Constructor
     *
     * @param {DipsConfigService} _dipsConfigService
     * @param {FormBuilder} _formBuilder
     */
    constructor(
        private _dipsConfigService: DipsConfigService,
        private _formBuilder: FormBuilder,
        private _traductor: DipsTranslationLoaderService,
        private _authService: AutentificacionService,
        private _router: Router,
        private _dipsProgressBarService: DipsProgressBarService

    )
    {
        // Configuracion de layout
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
        this.errorLogin = 'VACIO';
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
        this.loginForm = this._formBuilder.group({
            email   : ['', [Validators.required, Validators.email]],
            password: ['', Validators.required],
            remember: [false]
        });

        this._dipsProgressBarService.setMode('indeterminate');
    }

    // trae formulario para visualizar
    get f(){
        return this.loginForm.controls;
    }


    // google() {
    //     this._dipsProgressBarService.show();

    //     this._authService.inicioConGoogle();

    //     this._dipsProgressBarService.hide();

    // }

    async conMail(value: any){

        this.errorLogin = '';
        this._dipsProgressBarService.show();

        await this._authService.inicioConMail(value.email, value.password, value.remember);

        this._dipsProgressBarService.hide();

        console.log(this._authService.errorAuth);

        switch (this._authService.errorAuth) {
            case '': {  // no error
                this.errorLogin = 'VACIO';

                this._authService.userActual();

                this._router.navigate(['principal/inicio2']);
                break;
            }
            case undefined: {   //no error
                this.errorLogin = 'VACIO';

                this._authService.userActual();

                this._router.navigate(['principal/inicio2']);
                break;
            }
            case 'no-Confirmado': {
              this.errorLogin = 'NO-CONFIRMADO';
              break
            } 
            case 'auth/invalid-email': {
                this.errorLogin = 'INVALID-EMAIL';
                break
            } 
            case 'auth/user-disabled': {
                this.errorLogin = 'USER-DISABLED';
                break
            } 
            case 'auth/user-not-found': {
                this.errorLogin = 'USER-NOT-FOUND';
                break
            } 
            case 'auth/wrong-password': {
                this.errorLogin = 'WRONG-PASSWORD';
                break
            } 
            
            default:{
                this.errorLogin = 'CONEXION';
                break
            }

        }    

    }
 
}

