import { Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { TranslateService } from '@ngx-translate/core';
import * as _ from 'lodash';

import { DipsConfigService } from '../../../../@dips/services/config.service';
import { DipsSidebarService } from 'src/@dips/components/sidebar/sidebar.service';

import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { DipsAtencionDialogComponent } from '../../../../@dips/components/atencion-dialog/atencion-dialog.component';
//*import { UsuariosDatabase } from 'src/app/firebase/datos/usuarios/usuarios.database';

import { AutentificacionService } from 'src/app/sesion/autentificacion.service';
import { DipsUsuarioService } from 'src/@dips/services/usuario.service';
import { PHPService } from 'src/app/php/servicio/php.service';

// Parametros
import { DipsParametroService } from 'src/@dips/services/parametro/parametro.service';
import { DipsUtils } from 'src/@dips/utils';

// Datos
import { CajasDatabase } from 'src/app/firebase/datos/cajas';

import { navigation } from '../../../navigation/navigation';

// rutas
import { Router } from '@angular/router';
import { dateInputsHaveChanged } from '@angular/material/datepicker/datepicker-input-base';


@Component({
    selector     : 'toolbar',
    templateUrl  : './toolbar.component.html',
    styleUrls    : ['./toolbar.component.scss'],
    encapsulation: ViewEncapsulation.None
})

export class ToolbarComponent implements OnInit, OnDestroy
{
    horizontalNavbar!: boolean;
    rightNavbar!: boolean;
    hiddenNavbar!: boolean;
    languages: any;
    navigation: any;
    selectedLanguage: any;
    userStatusOptions: any[];

  
    // Private
    private _unsubscribeAll: Subject<any>;

    // Usuario 
    usuario: any;  
    atencionDialogoRef!: MatDialogRef<DipsAtencionDialogComponent> | null;

        // Parametros
        parametros: any;

    /**
     * Constructor
     *
     */
    constructor(
        private _dipsConfigService: DipsConfigService,
        private _dipsSidebarService: DipsSidebarService,
        private _translateService: TranslateService,
        private _authService: AutentificacionService,
        private _dipsUsuarioService: DipsUsuarioService,
        private _matDialog: MatDialog,
        private _phpService: PHPService,
        private _router: Router,
        private _parametrosService: DipsParametroService,
        private _cajasDB: CajasDatabase,

        )
    {

        // Set the defaults
        this.userStatusOptions = [
            {
                title: 'Online',
                icon : 'icon-checkbox-marked-circle',
                color: '#4CAF50'
            },
            {
                title: 'Away',
                icon : 'icon-clock',
                color: '#FFC107'
            },
            {
                title: 'Do not Disturb',
                icon : 'icon-minus-circle',
                color: '#F44336'
            },
            {
                title: 'Invisible',
                icon : 'icon-checkbox-blank-circle-outline',
                color: '#BDBDBD'
            },
            {
                title: 'Offline',
                icon : 'icon-checkbox-blank-circle-outline',
                color: '#616161'
            }
        ];

        this.languages = [
            {
                id   : 'es',
                title: 'Español',
                flag : 'es'
            },
            {
                id   : 'en',
                title: 'English',
                flag : 'us'
            }
        ];

        this.navigation = navigation;

        // Set the private defaults
        this._unsubscribeAll = new Subject();
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    /**
     * On init
     */
    ngOnInit(): void
    {
        // Subscribe to the config changes
        this._dipsConfigService.config
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((settings: any) => {
                this.horizontalNavbar = settings.layout.navbar.position === 'top';
                this.rightNavbar = settings.layout.navbar.position === 'right';
                this.hiddenNavbar = settings.layout.navbar.hidden === true;
            });

        // Set the selected language from default languages
        this.selectedLanguage = _.find(this.languages, {id: this._translateService.currentLang});

 
        this._dipsUsuarioService.getUsuario()
                    .subscribe((usuario: any) => {

                        console.log("USUARIO ++++++++++++++++")
                        console.log(usuario)
            this.usuario = usuario;

            // Analisis de Estado de Usuario
            if(this.usuario.estado != "") {
                this.usuarioEstado();
            }

            // Analisis de Sesion de Usuario
            if(this.usuario.sesion != "") {
                this.usuarioSesion();
            }

            // Analisis de Token PHP
            // if(this.usuario.uid != "" && this._phpService.token === undefined) {
            //     this.phpToken();
            // }

        })

        this._parametrosService.getParametros()
                    .subscribe((parametro) => {

                        console.log("PARAMETROS +++++++++++++++++")
                        console.log(parametro)
            this.parametros = parametro

            // if (parametro.cajaCerrada){     // solo si la caja esta cerrada
            //     this.sinEncargado();
            // }
        })

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

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------
    
    /**
     * Toggle sidebar open
     *
     * @param key
     */
    toggleSidebarOpen(key: any): void
    {
        this._dipsSidebarService.getSidebar(key).toggleOpen();
    }

    /**
     * Search
     *
     * @param value
     */
    // search(value: any): void
    // {
    //     // Do your search here...
    //     console.log(value);
    // }

    /**
     * Set the language
     *
     * @param lang
     */
    setLanguage(lang: any): void
    {
        // Set the selected language for the toolbar
        this.selectedLanguage = lang;

        // Use the selected language for translations
        this._translateService.use(lang.id);
    }

    async saleApp(){

        if (this.usuario.email === this.parametros.emailEncargado) {

            this._parametrosService.dialogoAbierto = true
 
            const datos = {
                cajaCerrada: true,
                emailEncargado: "",
                uidEncargado: ""
            }

            await this._parametrosService.actualizaDato(this.parametros.uid, datos)
            await this.cierraCaja(this.parametros.uidCaja)
            this._parametrosService.dialogoAbierto = false

        }

        this._authService.userFinSesion();
    }

    async cierraCaja(id: any) {
        
        const datos = {
            cerrada: true,
            fechaCierre: new Date,
        }
        await this._cajasDB.actualizaDato(id, datos)
    }

    // -----------------------------------------------------------------------------------------------------
    // @ ACCESO A SISTEMA
    // -----------------------------------------------------------------------------------------------------

    // ESTADO ==============================================================================================
    private usuarioEstado(){

        if (this.usuario.estado != 'Activo' && !this._dipsUsuarioService.dialogoAbierto) {

            this._dipsUsuarioService.dialogoAbierto = true; // flag que permite no abrir mas de 1 vez el dialogo

            switch (this.usuario.estado) {
                case 'Pendiente':
                    this.estadoPendiente();
                    break;
                
                case 'Rechazado':
                    this.estadoRechazado();
                    break;
            }

        }

    }

    private estadoPendiente(){

        // arma mensaje
        this.atencionDialogoRef = this._matDialog.open(DipsAtencionDialogComponent, {
            panelClass: 'atencion-dialog',
            disableClose: true,
            data      : {
                titulo: 'Sin acceso a Cuenta',
                linea1: 'La cuenta ' + this.usuario.emailCuenta + ' aún no autoriza su acceso.',
                linea2: '¿Desea Esperar o Reactivar su cuenta personal?',
                linea3: '',
                botonAceptar: 'Esperar aceptación',
                botonCancela: 'Volver a mi cuenta'
            }
    
        });

        // cuando cierra mensaje
        this.atencionDialogoRef.afterClosed().subscribe(respuesta => {
   
            if ( !respuesta ) {
    
                const dato = {
                    idCuenta: this.usuario.uid,
                    emailCuenta: this.usuario.email,
                    tipoAdmin: true,
                    estado: 'Activo',
                }
                this._authService.actualizaDato(this.usuario.uid, dato);

            } else {
                this.saleApp();
            }

            this.atencionDialogoRef = null;
            this._dipsUsuarioService.dialogoAbierto = false;  // permite nuevos dialogos
        });                
    }

    private estadoRechazado(){

        // arma mensaje
        this.atencionDialogoRef = this._matDialog.open(DipsAtencionDialogComponent, {
            panelClass: 'atencion-dialog',
            disableClose: true,
            data      : {
                titulo: 'Acceso Rechazado',
                linea1: 'La cuenta ' + this.usuario.emailCuenta + ' rechaza su acceso.',
                linea2: 'No podra seguir ingresando a esta cuenta',
                linea3: 'Si tiene dudas comuniquese con el Administrador.',
                botonAceptar: 'Entendido',
                botonCancela: ''
            }
    
        });

        // cuando cierra mensaje
        this.atencionDialogoRef.afterClosed().subscribe(respuesta => {
   
            const dato = {
                idCuenta: this.usuario.uid,
                emailCuenta: this.usuario.email,
                tipoAdmin: true,
                estado: 'Activo',
            }
            this._authService.actualizaDato(this.usuario.uid, dato);

            this.saleApp();

            this.atencionDialogoRef = null;
            this._dipsUsuarioService.dialogoAbierto = false;  // permite nuevos dialogos
        });                
    }

    // ENCARGADO ==============================================================================================
    private sinEncargado(){

        /*  Como trae datos viejos el IF
            garantiza que solo traiga el nuevo dato
        */
        if (this.usuario.sesion === this._dipsUsuarioService.sesion) {

            // como se dispara varias veces garantiza que solo lo haga 1 vez
            if (!this._parametrosService.dialogoAbierto) {
                this._parametrosService.dialogoAbierto = true

                if (this.parametros.cajaCerrada == true) {
                    if (this.usuario.tipoAdmin) {
                        this.mensajeParametrosAdmin()
                    } else if (this.usuario.tipoEncargado) {
                        this.mensajeParametrosEncargado()
                    } else {
                        this.mensajeParametrosOtros()
                    }
                }         
            }

        }
    }

    mensajeParametrosAdmin() {
        // arma mensaje
        this.atencionDialogoRef = this._matDialog.open(DipsAtencionDialogComponent, {
            panelClass: 'atencion-dialog',
            disableClose: true,
            data      : {
                titulo: 'Cuenta Sin Encargado',
                linea1: '',
                linea2: 'Se lo activara a Usted como Encargado',
                linea3: '',
                botonAceptar: 'Entendido',
                botonCancela: ''
            }
    
        });

        // cuando cierra mensaje
        this.atencionDialogoRef.afterClosed().subscribe(respuesta => {
   
            const datos = {
                emailEncargado: this.usuario.email,
                uidEncargado: this.usuario.uid,
                fechaEncargado: new Date,
                cajaCerrada: false,
                uidCaja: DipsUtils.generateGUID()
            }

            this._parametrosService.actualizaDato(this.parametros.uid, datos)

            this._parametrosService.abreCaja(datos)

            this.atencionDialogoRef = null;
            this._parametrosService.dialogoAbierto = false;  // permite nuevos dialogos
        }); 
    }   

    mensajeParametrosEncargado() {
        // arma mensaje
        this.atencionDialogoRef = this._matDialog.open(DipsAtencionDialogComponent, {
            panelClass: 'atencion-dialog',
            disableClose: true,
            data      : {
                titulo: 'Cuenta Sin Encargado',
                linea1: 'No hay Encargado Activo.',
                linea2: '¿Desea ser Usted el Encargado?',
                linea3: '',
                botonAceptar: 'Si',
                botonCancela: 'No'
            }
    
        });

        // cuando cierra mensaje
        this.atencionDialogoRef.afterClosed().subscribe(respuesta => {
   
            if ( respuesta ) {
                const datos = {
                    emailEncargado: this.usuario.email,
                    uidEncargado: this.usuario.uid,
                    cajaCerrada: false,
                    fechaEncargado: new Date,
                    uidCaja: DipsUtils.generateGUID()
                }
    
                this._parametrosService.actualizaDato(this.parametros.uid, datos)

                this._parametrosService.abreCaja(datos)

            } else {
                this.saleApp();
            }

            this.atencionDialogoRef = null;
            this._parametrosService.dialogoAbierto = false;  // permite nuevos dialogos
        });       
    } 

    mensajeParametrosOtros() {
        // arma mensaje
        this.atencionDialogoRef = this._matDialog.open(DipsAtencionDialogComponent, {
            panelClass: 'atencion-dialog',
            disableClose: true,
            data      : {
                titulo: 'Cuenta Sin Encargado',
                linea1: '',
                linea2: 'No puede operar el sistema sin Encargado',
                linea3: '',
                botonAceptar: 'Entendido',
                botonCancela: ''
            }
    
        });

        // cuando cierra mensaje
        this.atencionDialogoRef.afterClosed().subscribe(respuesta => {
   
            this.saleApp();

            this.atencionDialogoRef = null;
            this._parametrosService.dialogoAbierto = false;  // permite nuevos dialogos
        });       

    }

   // SESION ==============================================================================================
   private usuarioSesion(){

        if (this._dipsUsuarioService.sesion !== undefined) {

            console.log("sesion indefinida")

            // Cuando Inicia suele ser mas rapida la respuesta y trae datos viejos
            // asi durante el login no ve datos viejos
            if (this._dipsUsuarioService.login) {       
                if (this.usuario.sesion == this._dipsUsuarioService.sesion) { //si es igual finaliza login
                    this._dipsUsuarioService.login = false;
                }    

            } else {    // analiza sesion

                if (this.usuario.sesion !== this._dipsUsuarioService.sesion && !this._dipsUsuarioService.dialogoAbierto) {
        
                    this._dipsUsuarioService.dialogoAbierto = true; 
        
                    // arma mensaje
                    this.atencionDialogoRef = this._matDialog.open(DipsAtencionDialogComponent, {
                        panelClass: 'atencion-dialog',
                        disableClose: true,
                        data      : {
                            titulo: 'Acceso Denegado',
                            linea1: '',
                            linea2: 'Ha iniciado su cuenta en otro dispositivo.',
                            linea3: '',
                            botonAceptar: 'Entendido',
                            botonCancela: ''
                        }
                
                    });
        
                    // cuando cierra mensaje
                    this.atencionDialogoRef.afterClosed().subscribe(respuesta => {
            
                        this.saleApp();
        
                        this.atencionDialogoRef = null;
                        this._dipsUsuarioService.dialogoAbierto = false;  // permite nuevos dialogos
                    });                            
                }
            }
        }
    }

    // -----------------------------------------------------------------------------------------------------
    // @ PHP
    // -----------------------------------------------------------------------------------------------------

    /**
     * phpToken
     * 
     * esta rutina lee el token del PHP y lo guarda en la variable TOKEN del servicio phpService
     * 
     */
    private phpToken(){

        if(!this._phpService.leeTokenFlag) {  // permite que se dispare solo una vez

            this._phpService.leeTokenFlag = true;  

            this._phpService.getPHPToken(this.usuario.uid, this.usuario.idCuenta)
                    .subscribe(
                        datos => {
    
                            this._phpService.leeTokenFlag = false;

                            //*if (datos['estado'] == 'OK') {
                    
                            //*     this._phpService.token = datos['token'];
                    
                            //* } else {
                            //*     this._router.navigate(['sesion/login']);

                            //* }
                        },

                        error => {
                            this._phpService.leeTokenFlag = false;
                            console.log('Error critico ');
                            this._router.navigate(['sesion/login']);

                        }
                    );
        }


    }




}
