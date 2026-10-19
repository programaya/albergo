import { Component, OnDestroy, OnInit, ViewChild, ViewEncapsulation, Pipe } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { delay, filter, take, takeUntil, map } from 'rxjs/operators';

import { DipsConfigService } from '../../../../../../@dips/services/config.service';
import { DipsNavigationService } from '../../../../../../@dips/components/navigation/navigation.service';
import { DipsPerfectScrollbarDirective } from '../../../../../../@dips/directives/dips-perfect-scrollbar/dips-perfect-scrollbar.directive';
import { DipsSidebarService } from '../../../../../../@dips/components/sidebar/sidebar.service';

// Autentificacion
import { AutentificacionService } from 'src/app/sesion/autentificacion.service';
import { Cuentas } from '../../../../../sesion/cuenta.model';
import { Usuarios } from '../../../../../sesion/cuenta.model';
import { DipsUsuarioService } from '../../../../../../@dips/services/usuario.service';

// Parametros
import { DipsParametroService } from '../../../../../../@dips/services/parametro/parametro.service';
import { albergoParametro } from '../../../../../../@dips/services/parametro/parametro.model';

import { environment } from 'src/environments/environment';

@Component({
    selector: 'navbar-vertical-style-1',
    templateUrl: './style-1.component.html',
    styleUrls: ['./style-1.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class NavbarVerticalStyle1Component implements OnInit, OnDestroy {
    dipsConfig: any;
    navigation: any;

    // Usuario y Cuenta
    private usuario: Usuarios;
    cuenta: Cuentas;

    idCuenta: any;

    // Parametros
    //parametros: albergoParametro;

    public version: String = environment.version

    // Private
    private _dipsPerfectScrollbar!: DipsPerfectScrollbarDirective;
    private _unsubscribeAll: Subject<any>;

    /**
     * Constructor
     *
     */
    constructor(
        private _dipsConfigService: DipsConfigService,
        private _dipsNavigationService: DipsNavigationService,
        private _dipsSidebarService: DipsSidebarService,
        private _router: Router,
        private _authService: AutentificacionService,
        private _dipsUsuarioService: DipsUsuarioService,
        private _dipsParametroService: DipsParametroService
    ) {

        // Cuentas y Usuarios
        this.cuenta = new Cuentas;
        this.usuario = new Usuarios;

        // Parametros
        //this.parametros = new albergoParametro;

        // Set the private defaults
        this._unsubscribeAll = new Subject();

    }

    // -----------------------------------------------------------------------------------------------------
    // @ Accessors
    // -----------------------------------------------------------------------------------------------------

    // Directive
    @ViewChild(DipsPerfectScrollbarDirective, { static: true })
    set directive(theDirective: DipsPerfectScrollbarDirective) {
        if (!theDirective) {
            return;
        }

        this._dipsPerfectScrollbar = theDirective;

        // Update the scrollbar on collapsable item toggle
        this._dipsNavigationService.onItemCollapseToggled
            .pipe(
                delay(500),
                takeUntil(this._unsubscribeAll)
            )
            .subscribe(() => {
                this._dipsPerfectScrollbar.update();
            });

        // Scroll to the active item position
        this._router.events
            .pipe(
                filter((event) => event instanceof NavigationEnd),
                take(1)
            )
            .subscribe(() => {
                setTimeout(() => {
                    this._dipsPerfectScrollbar.scrollToElement('navbar .nav-link.active', -120);
                });
            }
            );

    }

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    /**
     * On init
     */
    ngOnInit(): void {
        this._router.events
            .pipe(
                filter((event) => event instanceof NavigationEnd),
                takeUntil(this._unsubscribeAll)
            )
            .subscribe(() => {
                if (this._dipsSidebarService.getSidebar('navbar')) {
                    this._dipsSidebarService.getSidebar('navbar').close();
                }
            }
            );

        // Subscribe to the config changes
        this._dipsConfigService.config
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((config: any) => {
                this.dipsConfig = config;
            });

        // Get current navigation
        this._dipsNavigationService.onNavigationChanged
            .pipe(
                filter(value => value !== null),
                takeUntil(this._unsubscribeAll)
            )
            .subscribe(() => {
                this.navigation = this._dipsNavigationService.getCurrentNavigation();
            });

        // Usuario y Cuenta
        this.usuarioConectado();

    }

    /**
     * On destroy
     */
    ngOnDestroy(): void {
        // Unsubscribe from all subscriptions
        this._unsubscribeAll.next();
        this._unsubscribeAll.complete();
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Usuario y Cuenta
    // -----------------------------------------------------------------------------------------------------
    /**
     * Estas funciones se suscriben tanto a la cuenta de usuario
     * como a la de cuentas para permitir realizar acciones segun que 
     * cuenta este activa
     */

    // verifica que este conectado
    usuarioConectado() {
        // Actualiza los datos del actual usuario
        this._authService.userDato.subscribe(
            (user) => {
                if (user) {
                    if (user.emailVerified) {
                        this.datosUsuario(user.uid);
                    }
                }
            }
        );
    }

    // extrae datos Usuario
    datosUsuario(idUsuario: any) {

        this._authService.traeUsuario(idUsuario)
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((resp: any) => {

                this.usuario = new Usuarios(resp.payload.data());

                // no siempre leer todo por eso el if
                if (this.usuario.estado != "") {
                    this._dipsUsuarioService.setUsuario(this.usuario);
                    this.datosCuenta(this.usuario.idCuenta);
                }

            });
    }

    // extrae datos de Cuenta
    datosCuenta(idCuenta: any) {

        // si no se informa la cuenta toma la del usuario
        if (idCuenta == '') {
            idCuenta = this._authService.userDetalle.uid;
        }

        this._authService.traeCuenta(idCuenta)
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((resp: any) => {

                this.cuenta = new Cuentas(resp.payload.data());
                this._dipsUsuarioService.setCuenta(idCuenta);
                this.ajustaNavigator();
            });

        // Parametros Globales
        this.globalParametros(idCuenta);
        this.idCuenta = idCuenta; // lo fija para el llamado de parametros


    }

    // -----------------------------------------------------------------------------------------------------
    // @ Parametros
    // -----------------------------------------------------------------------------------------------------

    /**
     * 
     * Los parametros globales tienen informacion de como debe mostrarse el sistema
     * ademas tienen tambien informacion de como proceder en algunos procesos
     * el modelo de los parametros esta en @dips/services/parametros
     */
    globalParametros(idCuenta: any) {

        // si no se informa la cuenta toma la del usuario
        if (idCuenta == '') {
            idCuenta = this._authService.userDetalle.uid;
        }

        // trae los datos en la base de datos
        this._dipsParametroService.traeConfiguracion(idCuenta)
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((dato) => {


            });

    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Toggle sidebar opened status
     */
    toggleSidebarOpened(): void {
        this._dipsSidebarService.getSidebar('navbar').toggleOpen();
    }

    /**
     * Toggle sidebar folded status
     */
    toggleSidebarFolded(): void {
        this._dipsSidebarService.getSidebar('navbar').toggleFold();
    }



    // -----------------------------------------------------------------------------------------------------
    // @ manejo de Navigator
    // -----------------------------------------------------------------------------------------------------

    /**
     * ajustaNavigator
     * 
     * actua sobre el menu lateral y maneja las instancias si se es o no administrador
     */
    private ajustaNavigator() {

        const adminMenu = [
            {
                id: 'registroAdmin',
                title: 'Registros',
                //        translate: 'NAV.INICIO.TITLE',
                type: 'item',
                icon: 'meeting_room',
                url: '/admin/registro/listado',
            },

            // {
            //     id: 'cajaAdmin',
            //     title: 'Cajas',
            //     //        translate: 'NAV.INICIO.TITLE',
            //     type: 'item',
            //     icon: 'meeting_room',
            //     url: '/admin/registro/listado',
            // },

            {
                id: 'adminHabita',
                title: 'Habitaciones',
                //        translate: 'NAV.INICIO.TITLE',
                type: 'item',
                icon: 'meeting_room',
                url: '/admin/habita/listado',
            },

            {
                id: 'promoHabita',
                title: 'Promociones',
                //        translate: 'NAV.INICIO.TITLE',
                type: 'item',
                icon: 'monetization_on',
                url: '/admin/promo/listado',
            },

            {
                id: 'adminUsu',
                title: 'Usuarios',
                //        translate: 'NAV.INICIO.TITLE',
                type: 'item',
                icon: 'supervisor_account',
                url: '/admin/fsusuarios/listado',
            },

            {
                id: 'adminConfig',
                title: 'Configuración',
                //        translate: 'NAV.INICIO.TITLE',
                type: 'item',
                icon: 'settings',
                url: '/admin/config/' + this.idCuenta,
                badge: {
                }
            }
        ];

        // oculta si no es administrador
        if (this.usuario.tipoAdmin) {
            this._dipsNavigationService.updateNavigationItem('admin', { hidden: false });
        } else {
            this._dipsNavigationService.updateNavigationItem('admin', { hidden: true });
        }

        //indica el numero de avisos que tiene
        this._dipsNavigationService.removeNavigationItem('usuAdmin');

        this._dipsNavigationService.updateNavigationItem('admin', { children: adminMenu })

    }

}
