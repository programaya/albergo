import { Component, OnDestroy, ViewEncapsulation, OnInit } from '@angular/core';
import { dipsAnimations } from '../../../@dips/animations';

import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { Location } from '@angular/common';

// RXJS
import { Subject } from 'rxjs';
import { takeUntil, distinctUntilChanged } from 'rxjs/operators';

//Cuenta
import { AutentificacionService } from 'src/app/sesion/autentificacion.service';
import { Usuarios } from '../../sesion/cuenta.model';
import { Cuentas } from '../../sesion/cuenta.model';

// Multi-idiomas
import { DipsTranslationLoaderService } from 'src/@dips/services/translation-loader.service';
import { locale as espanol } from './../i18n/es'; // importar todos los idiomas que se utilicen


@Component({
  selector:    'perfil',
  templateUrl: './perfil.component.html',
  styleUrls:   ['./perfil.component.scss'],
  encapsulation: ViewEncapsulation.None,
  animations   : dipsAnimations
})
export class PerfilComponent implements OnInit, OnDestroy
{

  // Variables
  private _unsubscribeAll: Subject<any>;

  //datos de cuenta
  usuario: Usuarios; 
  cuenta: Cuentas;            

  // variables de Form
  perfilForm!: FormGroup;
  errorPerfil: any;

  // permite detectar cambios en el idCuenta
  private idCuentaViejo: any;
  private idCuentaNuevo: any;

  constructor(
      private _traductor: DipsTranslationLoaderService,
      private _authService: AutentificacionService,
      private _formBuilder: FormBuilder,
      private _location: Location
      ) 
  {

    // para que no de como indefinido
    this.usuario = new Usuarios();  
    this.cuenta = new Cuentas();

    // Set the private defaults
    this._unsubscribeAll = new Subject();

    // Multi-idiomas
    this.errorPerfil = '';
    this._traductor.loadTranslations(espanol); // ejemplo this._translationLoader.loadTranslations(espanol, turkish);

  }

  // -----------------------------------------------------------------------------------------------------
  // @ Ciclo de Vida
  // -----------------------------------------------------------------------------------------------------

  ngOnInit() {

    this.inicializaForm();

  // Datos de Usuario
    this._authService.traeUsuario(this._authService.userDetalle.uid)
          .pipe(takeUntil(this._unsubscribeAll))
          .subscribe((usuario: any) => {
              this.usuario = new Usuarios(usuario.payload.data());

              // Datos Cuenta
              this._authService.traeCuenta(this._authService.userDetalle.uid)
                    .pipe(takeUntil(this._unsubscribeAll))
                    .subscribe((cuenta: any) => {
                        this.cuenta = new Cuentas(cuenta.payload.data());

                        this.construyeForm();

                        this.cambioAdmin();
                        this.pantallaAdmin(this.f.tipoAdmin.value);

                        //Datos de CuentaEmpresa
                        this.idCuentaViejo = this.usuario.idCuenta;
                        this.idCuentaNuevo = this.usuario.idCuenta;

                    });   
          });
    
  }

  ngOnDestroy(): void
  {
      // Unsubscribe from all subscriptions
      this._unsubscribeAll.next();
      this._unsubscribeAll.complete();
  }

  //! ANALIZAR ERROR
  // trae formulario para visualizar
  get f(){
      return this.perfilForm.controls;
  }

  // -----------------------------------------------------------------------------------------------------
  // @ Funciones de Form
  // -----------------------------------------------------------------------------------------------------

  inicializaForm()
  {
    this.perfilForm = new FormGroup({

      // Perfil
      nombre: new FormControl(),
      // foto: new FormControl(),
      tipoAdmin: new FormControl(),

      // Cuenta
      cuentaNombre: new FormControl(),
      cuentaEslogan: new FormControl(),
      // cuentaFoto: new FormControl(),
      cuentaComparte: new FormControl(),

      //usuario de Cuenta
      emailCuenta: new FormControl(),

    });

  }

  construyeForm(){

    if (this.perfilForm){
      this.perfilForm.reset();
    }

     this.perfilForm = this._formBuilder.group({

      // Perfil
      nombre: [this.usuario.nombre, [Validators.required]],
      // foto: [this.usuario.foto],
      tipoAdmin: [this.usuario.tipoAdmin ? 'true' : 'false'],

      // Cuenta
      cuentaNombre: [this.cuenta.nombre],
      cuentaEslogan: [this.cuenta.eslogan],
      // cuentaFoto: [this.cuenta.foto],
      cuentaComparte: [this.cuenta.comparteCuenta],

      //usuario de Cuenta
      emailCuenta: [this.usuario.emailCuenta]
    })
    
  }

  // -----------------------------------------------------------------------------------------------------
  // @ Manejo de Pantallas
  // -----------------------------------------------------------------------------------------------------

  cambioAdmin() {

      this.f.tipoAdmin.valueChanges
            .subscribe(seleccion => {
                this.pantallaAdmin(seleccion);
            });
  }

  pantallaAdmin(valor: any) {

    if(valor == 'true') {       //cuenta - admin
      document.getElementById('block-admin')!.style.display = 'block';
      document.getElementById('block-user')!.style.display = 'none';
      this.f.emailCuenta.setValidators(null);
      this.f.emailCuenta.setValue('');
      this.errorPerfil = '';

    } else {                    //cuenta - usuario
      document.getElementById('block-admin')!.style.display = 'none';
      document.getElementById('block-user')!.style.display = 'block';
      this.f.emailCuenta.setValidators([Validators.required ,Validators.email]);

    }

    // Activo validity
    this.f.emailCuenta.updateValueAndValidity();

  }

  // -----------------------------------------------------------------------------------------------------
  // @ Funciones de Generales
  // -----------------------------------------------------------------------------------------------------



  buscaCuenta(){
    this.errorPerfil = "";

    const dataForm = this.perfilForm.getRawValue();

    this._authService.buscaCuenta(dataForm.emailCuenta)
        .pipe(takeUntil(this._unsubscribeAll))
        .subscribe((cuenta: any) => {

          if (cuenta.length == 0){
            this.errorPerfil = 'Cuenta no Localizada';

            } else {
             cuenta.map((datoLocalizado: any) => {
                 const campos = datoLocalizado.payload.doc.data() as Cuentas

                 if (this.usuario.uid == campos.uid ) {
                   this.errorPerfil = 'La cuenta a la que se Asocia no puede ser la misma que la de Usuario';
                   return
                 }

                  // if (!campos.tipoAdmin) {
                  //   this.errorPerfil = 'Esta No es una cuenta Administrador';
                  //   return
                  // }

                 if (!campos.comparteCuenta) {
                   this.errorPerfil = 'Este Administrador no comparte su cuenta';
                   return
                 }

                 // salvar datos
                 this.idCuentaNuevo = campos.uid;
                  
             })
           }
   });
 
  }

  // -----------------------------------------------------------------------------------------------------
  // @ Funciones de Botones
  // -----------------------------------------------------------------------------------------------------

  /**
   * returnaPagAnterior
   * 
   * retorna
   */
  retornaPagAnterior(){
    this._location.back();
  }

  /**
   * salvaDatos
   * 
   * guarda la informacion
   */
  salvaDato() {

    // salva dato si no hay registrado un error
    if (this.errorPerfil == '') {
      const data = this.perfilForm.getRawValue();

      data.email = this.usuario.email;

      if (data.cuentaNombre === undefined ) { data.cuentaNombre = ''} // si el nombre de la cuenta es indefinido le asigno vacio

      // Datos por defecto
      if (data.tipoAdmin == 'true') {   // Admin
 
        console.log('admin ' + this.usuario.email)

        data.idCuenta = this.usuario.uid;
        data.emailCuenta = this.usuario.email;
        data.estado = 'Activo';

      } else {                // Usuario

        // cambio la cuenta?
        if (this.idCuentaNuevo == this.idCuentaViejo){
          data.estado = this.usuario.estado;
        } else {
          data.estado = 'Pendiente';
        }

        data.idCuenta = this.idCuentaNuevo;
        data.comparteCuenta = false;
      }

      this._authService.actualizaPerfil(data);
  
      this.retornaPagAnterior()
    }
  }


  cambiaAvatar(){
    console.log('pulso AVATAR')
  }

}
