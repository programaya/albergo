import { Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';

import { AbstractControl, FormBuilder, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { DipsConfigService } from '../../../@dips/services/config.service';
import { dipsAnimations } from '../../../@dips/animations';

import { AutentificacionService } from '../autentificacion.service';

// rutas
import { Router } from '@angular/router';

//import { Message } from '@angular/compiler/src/i18n/i18n_ast';

// Multi-idiomas
import { DipsTranslationLoaderService } from 'src/@dips/services/translation-loader.service';
import { locale as espanol } from './../i18n/es'; // importar todos los idiomas que se utilicen


@Component({
  selector: 'register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss'],
  encapsulation: ViewEncapsulation.None,
  animations   : dipsAnimations
})
export class RegisterComponent implements OnInit, OnDestroy {

  registerForm!: FormGroup;

  // Private
  private _unsubscribeAll: Subject<any>;
  errorRegistro: any;

  constructor(
      private _dipsConfigService: DipsConfigService,
      private _formBuilder: FormBuilder,
      private _authService: AutentificacionService,
      private _traductor: DipsTranslationLoaderService,
      private _router: Router

    ){

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
    
    // Set the private defaults
    this._unsubscribeAll = new Subject();

    // Multi-idiomas
    this.errorRegistro = 'VACIO';
    this._traductor.loadTranslations(espanol); // ejemplo this._translationLoader.loadTranslations(espanol, turkish);

  }

  // -----------------------------------------------------------------------------------------------------
  // @ Lifecycle hooks
  // -----------------------------------------------------------------------------------------------------

  /**
   * On init
   */
  ngOnInit() {
    this.registerForm = this._formBuilder.group({
        nombre         : ['', Validators.required],
        email          : ['', [Validators.required, Validators.email]],
        password       : ['', Validators.required],
        passwordConfirm: ['', [Validators.required, confirmPasswordValidator]]
    });

    // Actualiza la validez del campo 'passwordConfirm' cuando
    // el campo 'password' a cambiado
    this.registerForm.get('password')!.valueChanges
        .pipe(takeUntil(this._unsubscribeAll))
        .subscribe(() => {
            this.registerForm.get('passwordConfirm')!.updateValueAndValidity();
        });
  }

  /**
   * On destroy
   */
  ngOnDestroy(): void
  {
      // Unsubscribe from all subscriptions
      this._unsubscribeAll.next();
      this._unsubscribeAll.complete();
  }

    // trae formulario para visualizar
    get f(){
        return this.registerForm.controls;
    }

  async registro(valor: any) {

    this.errorRegistro = '';

    await this._authService.registroConMail(valor.email, valor.password, valor.nombre);

    switch (this._authService.errorAuth) {
      case '': {  // no error
        this.errorRegistro = 'VACIO';
        this._authService.confirmaEmail = valor.email;
        this._router.navigate(['sesion/confirma']);
        break;

      }
      case undefined: {  // no error
        this.errorRegistro = 'VACIO';
        this._authService.confirmaEmail = valor.email;
        this._router.navigate(['sesion/confirma']);
        break;

      }

      case 'auth/email-already-in-use': {
        this.errorRegistro = 'EMAIL-ALREADY-IN-USE';
        break
      } 
      case 'auth/invalid-email': {
        this.errorRegistro = 'INVALID-EMAIL';
        break
      } 
      case 'auth/operation-not-allowed': {
        this.errorRegistro = 'OPERATION-NOT-ALLOWED';
        break
      } 
      case 'auth/weak-password': {
        this.errorRegistro = 'WEAK-PASSWORD';
        break
      } 

      default:{
        this.errorRegistro = 'CONEXION';

        break
      }

    }

  }    



}

/**
* Confirm password validator
*
* @param {AbstractControl} control
* @returns {ValidationErrors | null}
*/
export const confirmPasswordValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {

  if ( !control.parent || !control )
  {
      return null;
  }

  const password = control.parent.get('password');
  const passwordConfirm = control.parent.get('passwordConfirm');

  if ( !password || !passwordConfirm )
  {
      return null;
  }

  if ( passwordConfirm.value === '' )
  {
      return null;
  }

  if ( password.value === passwordConfirm.value )
  {
      return null;
  }

  return {passwordsNotMatching: true};

}