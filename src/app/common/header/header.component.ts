import { NgClass } from '@angular/common';
import { MatMenuModule } from '@angular/material/menu';
import { Component, HostListener, inject, OnDestroy, OnInit } from '@angular/core';
import { ToggleService } from '../sidebar/toggle.service';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterLink } from '@angular/router';
import { CustomizerSettingsService } from '../../perfil/customizer-settings/customizer-settings.service';

import { SyncService, SyncResult } from '@dbSync/sync.service'
import { SYNC_COLLECTIONS } from '@dbSync/sync.coleccion'
import { forkJoin, map, Observable, Subject, Subscription, switchMap, takeUntil } from 'rxjs';
//import { AutentificacionService } from '../../authentication/autentificacion.service';
import { NgIf } from '@angular/common';
import { Cuentas, Usuarios } from '@dbTabla/cuenta.model';
import { doc, Firestore, onSnapshot } from '@angular/fire/firestore';
import { DipsUsuarioService } from '@serv/usuario/usuario.service'
//import { AutentificacionService } from '@base/src/app/authentication/autentificacion.service'
import { onValue } from '@angular/fire/database';
import { AvatarFotoComponent } from '@base/src/app/common/service/avatar-foto/avatar-foto.component';

// Dialogo
//import { DipsDialogo } from '@base/src/app/common/service/dialogo/dips-dialog.component';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';

// Permisos
import { PermisoService } from '@permiso/permiso.service'
import { planPermiso } from '@permiso/plan.permiso'
import { PlanesService } from '@plan/planes.service'
import { MatDividerModule } from '@angular/material/divider';
import { DipsDialogo } from '../service/dialogo/dips-dialogo.component';
import { DipsDialogoService } from '../service/dialogo/dips-dialog.service';
import { NgxWebTourModule, TourService } from '@abbasmgz/ngx-web-tour';

@Component({
    selector: 'app-header',
    imports: [
        NgClass,
        NgIf,
        MatMenuModule,
        MatButtonModule,
        MatDividerModule,
        RouterLink,
        AvatarFotoComponent,
        MatTooltipModule,
        NgxWebTourModule

    ],
    templateUrl: './header.component.html',
    styleUrl: './header.component.scss',
})
export class HeaderComponent implements OnInit, OnDestroy {

    // isSidebarToggled
    isSidebarToggled = false;

    // isToggled
    isToggled = false;

    // Dark Modo
    isDarkModo = false;

    // Permiso administrador
    esAdministrador = false

    // Tutorial
    _tourActivo = false;
    _tourInicial = false

    // Sincronizacion
    private _syncSubscripcion!: Subscription
    private _estaSincronizando = false
    private _syncResults: {
        collectionName: string;
        lastSyncTime: string;
        uploaded: number;
        downloaded: number;
        conflicts: number
    }[] = [];

    private _errorMessages: string[] = [];

    // Usuario y cuenta
    usuarioDatos?: Usuarios;
    cuentaDatos?: Cuentas;

    private destroy$ = new Subject<void>();

    //avatar
    avatarFoto: any = 'images/admin.png'
    avatarNombre: any

    // Perfil
    perfilRol: any

    atencionDialogoRef?: MatDialogRef<DipsDialogo>

    dipsDialogoService = inject(DipsDialogoService)

    constructor(
        private toggleService: ToggleService,
        public themeService: CustomizerSettingsService,
        private _syncService: SyncService,
        private _permisoService: PermisoService,
        private _db: Firestore,
        private _dipsUsuarioService: DipsUsuarioService,
        private _matDialog: MatDialog,
        private _planService: PlanesService,
        private _tourService: TourService
    ) {

        this.toggleService.isSidebarToggled$.subscribe(isSidebarToggled => {
            this.isSidebarToggled = isSidebarToggled;
        });
        this.themeService.isToggled$.subscribe(isToggled => {
            this.isToggled = isToggled;
        });

        // Modo activo
        this.isDarkModo = this.themeService.isDark();

        // Datos Usuario
        this._dipsUsuarioService.usuarioUID$.pipe(
            takeUntil(this.destroy$)
        ).subscribe((userUID: any) => {

            if (userUID != '') {
                const userRef = doc(this._db, this._dipsUsuarioService.coleccionUsuarios, userUID!);

                onSnapshot(userRef, (async (datoUser: any) => {
                    this.usuarioDatos = datoUser.data()
                    console.log(" USUARIO ", this.usuarioDatos)

                    if (this.usuarioDatos) {
                        this._dipsUsuarioService.setUsuario(this.usuarioDatos);
                    } else {
                        console.warn('usuarioDatos es undefined, no se actualizará el usuario');
                    }

                    this._cambioUsuario()

                    // acceso a Perfil
                    if (this.usuarioDatos?.foto == '' || this.usuarioDatos?.foto == null) {
                        this.avatarFoto = 'images/admin.png'
                    } else {
                        this.avatarFoto = this.usuarioDatos?.foto.trim()
                    }
                    this.avatarNombre = this.usuarioDatos?.nombre

                    //salva administrador
                    this.esAdministrador = this.usuarioDatos?.tipoAdmin || false


                    if (this.esAdministrador) {
                        this.perfilRol = 'Administrador'
                    } else {
                        this.perfilRol = this.usuarioDatos?.rol
                    }

                    // Tutorial
                    // ✅ Solo inicia el tour si: datos==0 Y no se inició antes
                    if (this.usuarioDatos?.datos == 0) {

                        this._dipsUsuarioService.tutorialInicial = true;

                        // Actualiza en Firestore (puede ser async, no bloquea)
                        this.usuarioDatos!.datos = 1        // marca que ha visto el tutorial
                        await this._dipsUsuarioService.salvaUsuario({ datos: this.usuarioDatos!.datos }) // salva el cambio
                    }

                }))
            }
        })
    }

    // ====================================================
    // ciclo de vida
    // ====================================================

    ngOnInit(): void {

        // Datos de cuenta
        this._dipsUsuarioService.cuenta$.subscribe((cuenta) => {
            this.cuentaDatos = cuenta

            console.log(" CUENTA Header ", this.cuentaDatos)

            // solo cuando se accede a los datos de la cuenta
            if (this.cuentaDatos?.uid != '' && this.cuentaDatos?.uid != null) {
                this._cambioCuenta()
            }
        })

    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }

    // Burger Menu Toggle
    toggle() {
        this.toggleService.toggle();
    }

    // Header Sticky
    isSticky: boolean = false;
    @HostListener('window:scroll', ['$event'])
    checkScroll() {
        const scrollPosition = window.scrollY || document.documentElement.scrollTop || document.body.scrollTop || 0;
        if (scrollPosition >= 50) {
            this.isSticky = true;
        } else {
            this.isSticky = false;
        }
    }

    // Dark Mode
    toggleTheme() {
        this.themeService.toggleTheme();
        this.isDarkModo = this.themeService.isDark();
    }

    get fotoLimpia(): string {
        console.log(" FOTO ", (this.usuarioDatos?.foto || 'images/admin.png').trim())
        return (this.usuarioDatos?.foto || 'images/admin.png').trim();
    }



    // ====================================================
    // Lanzadores de Sincronizacion
    // ====================================================

    private _lanzaSync() {

        if (this.cuentaDatos?.plan?.permisos !== undefined &&
            this._permisoService.tienePermiso(this.cuentaDatos.plan.permisos, 16)) {

            console.log('Iniciando subscripción a cambios de sincronización...');
            this._syncSubscripcion = this._syncService.cambio$.pipe(
                takeUntil(this.destroy$)
            )
                .subscribe(() => {
                    console.log('Cambio detectado → Sincronizando...');
                    this.syncTodo()
                    //   this._syncService.performFullSync('items').subscribe(result => {
                    //     console.log('Sincronización terminada:', result);
                    //     // Aquí podemos mostrar un mensaje de éxito/error
                    //   });
                });


        } else {            // Si no tiene permiso de sincronizacion
            console.log('El usuario no tiene permiso de sincronización o no hay datos de cuenta disponibles.');
            if (this._syncSubscripcion != undefined) {
                this._syncSubscripcion.unsubscribe();
                console.log('Se ha detenido la subscripción a cambios de sincronización.');
            }
        }

    }

    syncTodo() {
        // No ejecuta si esta sincronizando
        if (this._estaSincronizando) { return }

        this._estaSincronizando = true;

        this._syncTodasColecciones().subscribe(result => {
            console.log("syncTodo", result)
            this._syncResults = result.results.map(r => ({
                collectionName: r.collectionName,
                lastSyncTime: r.lastSyncTime,
                uploaded: r.uploaded,
                downloaded: r.downloaded,
                conflicts: r.conflicts
            }));

            this._errorMessages = result.errors;
            this._estaSincronizando = false;

            console.log('✅ Sincronización masiva completada:', result);
        });
    }

    // syncGlobalOnly() {
    //     this.isSyncing = true;
    //     this.syncManager.syncGlobalCollections().subscribe(result => {
    //       this.syncResults = result.results.map(r => ({
    //         collectionName: r.collectionName,
    //         lastSyncTime: r.lastSyncTime,
    //         uploaded: r.uploaded,
    //         downloaded: r.downloaded,
    //         conflicts: r.conflicts
    //       }));
    //       this.errorMessages = result.errors;
    //       this.isSyncing = false;
    //       console.log('✅ Solo colecciones globales sincronizadas:', result);
    //     });
    // }

    // syncLocalOnly() {
    //     this.isSyncing = true;
    //     this.syncManager.syncLocalCollections().subscribe(result => {
    //       this.syncResults = result.results.map(r => ({
    //         collectionName: r.collectionName,
    //         lastSyncTime: r.lastSyncTime,
    //         uploaded: r.uploaded,
    //         downloaded: r.downloaded,
    //         conflicts: r.conflicts
    //       }));
    //       this.errorMessages = result.errors;
    //       this.isSyncing = false;
    //       console.log('✅ Solo colecciones locales sincronizadas:', result);
    //     });
    // }

    // ====================================================
    // Metodos de Sincronizacion
    // ====================================================

    /**
     * Sincroniza todas las colecciones definidas en SYNC_COLLECTIONS
     */
    private _syncTodasColecciones(): Observable<{ results: SyncResult[], errors: string[] }> {

        console.log("+++++++++++++++++++++++++++++++++++++++ sincro")
        const observables = SYNC_COLLECTIONS.map(config =>

            this._syncService.performFullSync(config.name, config.options)//.pipe(
            // map(result => ({
            //     ...result,
            //     collectionName: config.name
            // }))
            //)

        );

        return forkJoin(observables).pipe(
            map(results => {
                const errors = results
                    .filter(r => r.errors?.length > 0)
                    .flatMap(r => r.errors);

                return {
                    results,
                    errors
                };
            })
        );
    }

    // private _syncTodasColecciones(): Observable<{ results: SyncResult[], errors: string[] }> {
    //     const observables = SYNC_COLLECTIONS.map(config => {
    //         this._syncService.performFullSync(config.name, config.options)
    //     });

    //     return forkJoin(observables).pipe(
    //     map(results => {
    //         const allResults = results.map(r => ({
    //             collectionName: SYNC_COLLECTIONS.find(c => c.name === r.lastSyncTime)?.name || '',
    //             ...r
    //         }));

    //         const errors = results
    //         .filter(r => r.errors.length > 0)
    //         .flatMap(r => r.errors);

    //         return {
    //         results: allResults,
    //         errors
    //         };
    //     })
    //     );
    // }

    /**
     * Sincroniza solo colecciones globales
     */
    // public syncGlobalCollections(): Observable<{ results: SyncResult[], errors: string[] }> {
    //     const globalCollections = SYNC_COLLECTIONS.filter(c => c.options.isGlobal);
    //     const observables = globalCollections.map(config =>
    //     this.syncService.performFullSync(config.name, config.options)
    //     );

    //     return forkJoin(observables).pipe(
    //     map(results => {
    //         const allResults = results.map(r => ({
    //         collectionName: SYNC_COLLECTIONS.find(c => c.name === r.lastSyncedAt)?.name || '',
    //         ...r
    //         }));
    //         const errors = results.flatMap(r => r.errors);
    //         return { results: allResults, errors };
    //     })
    //     );
    // }

    /**
     * Sincroniza solo colecciones locales a una sucursal
     */
    // public syncLocalCollections(): Observable<{ results: SyncResult[], errors: string[] }> {
    //     const localCollections = SYNC_COLLECTIONS.filter(c => !c.options.isGlobal);
    //     const observables = localCollections.map(config =>
    //     this.syncService.performFullSync(config.name, config.options)
    //     );

    //     return forkJoin(observables).pipe(
    //     map(results => {
    //         const allResults = results.map(r => ({
    //         collectionName: SYNC_COLLECTIONS.find(c => c.name === r.lastSyncedAt)?.name || '',
    //         ...r
    //         }));
    //         const errors = results.flatMap(r => r.errors);
    //         return { results: allResults, errors };
    //     })
    //     );
    // }

    // -----------------------------------------------------------------------------------------------------
    // @ ACCESO A SISTEMA
    // -----------------------------------------------------------------------------------------------------

    //? DATOS CUENTA DINAMICO
    private _cambioCuenta() {

        // Sincronizacion
        this._lanzaSync()

        // Vigencia de Plan
        if (this.cuentaDatos?.plan.id != undefined) {
            this._planService.verificarVencimientos(this.cuentaDatos)
        }

        //todo hacer todas las limitaciones de permisos
    }


    //? Datos Usuario dinamico
    private _cambioUsuario() {

        // Actualiza id Cuenta
        this._syncService.cuentaUID = this.usuarioDatos?.idCuenta

        //todo terminar

        // Analisis de Estado de Usuario
        if (this.usuarioDatos?.estado != "") {
            this.usuarioEstado();
        }

        // Analisis de Sesion de Usuario
        if (this.usuarioDatos?.sesion != "") {
            this.usuarioSesion();
        }
    }

    // TUTORIAL ==============================================================================================
    mostrarTutorial() {
        //       this.isTutorialVisible != this.isTutorialVisible;
        this._tourService.start('gessi-tutorial');
    }

    cerrarTutorial() {
        //  this.isTutorialVisible = false;

        this._tourService.end(); // Finaliza el tour si está activo
    }

    // ESTADO ==============================================================================================
    private usuarioEstado() {

        if (this.usuarioDatos?.estado != 'Activo' &&
            !this._dipsUsuarioService.dialogoAbierto) {

            this._dipsUsuarioService.dialogoAbierto = true; // flag que permite no abrir mas de 1 vez el dialogo

            switch (this.usuarioDatos?.estado) {
                case 'Pendiente':
                    this.estadoPendiente();
                    break;

                case 'Rechazado':
                    this.estadoRechazado();
                    break;
            }

        }

    }

    private estadoPendiente() {

        // arma mensaje
        this.atencionDialogoRef = this._matDialog.open(DipsDialogo, {
            width: '250px',
            enterAnimationDuration: '3000ms',
            exitAnimationDuration: '1500ms',

            data: {
                titulo: 'Sin acceso a Cuenta',
                linea1: 'La cuenta ' + this.usuarioDatos?.emailCuenta + ' aún no autoriza su acceso.',
                linea2: '¿Desea Esperar o Reactivar su cuenta personal?',
                linea3: '',
                btnAceptar: 'Esperar aceptación',
                btnCancela: 'Volver a mi cuenta'
            }

        });

        // cuando cierra mensaje
        this.atencionDialogoRef.afterClosed().subscribe(respuesta => {

            if (!respuesta) {

                console.log("respuesta NO", respuesta)

                // const dato = {
                //     idCuenta: this.usuarioDatos?.uid,
                //     emailCuenta: this.usuarioDatos?.email,
                //     tipoAdmin: true,
                //     estado: 'Activo',
                // }
                // this._authService.actualizaDato(this.usuario.uid, dato);

            } else {

                console.log("respuesta OK", respuesta)
                // this.saleApp();
            }

            // this.atencionDialogoRef = null;
            this._dipsUsuarioService.dialogoAbierto = false;  // permite nuevos dialogos
        });
    }

    private estadoRechazado() {

        // // arma mensaje
        // this.atencionDialogoRef = this._matDialog.open(DipsAtencionDialogComponent, {
        //     panelClass: 'atencion-dialog',
        //     disableClose: true,
        //     data      : {
        //         titulo: 'Acceso Rechazado',
        //         linea1: 'La cuenta ' + this.usuario.emailCuenta + ' rechaza su acceso.',
        //         linea2: 'No podra seguir ingresando a esta cuenta',
        //         linea3: 'Si tiene dudas comuniquese con el Administrador.',
        //         botonAceptar: 'Entendido',
        //         botonCancela: ''
        //     }

        // });

        // // cuando cierra mensaje
        // this.atencionDialogoRef.afterClosed().subscribe(respuesta => {

        //     const dato = {
        //         idCuenta: this.usuario.uid,
        //         emailCuenta: this.usuario.email,
        //         tipoAdmin: true,
        //         estado: 'Activo',
        //     }
        //     this._authService.actualizaDato(this.usuario.uid, dato);

        //     this.saleApp();

        //     this.atencionDialogoRef = null;
        //     this._dipsUsuarioService.dialogoAbierto = false;  // permite nuevos dialogos
        // });
    }

    // SESION ==============================================================================================
    private usuarioSesion() {

        // if (this._dipsUsuarioService.sesion !== undefined) {

        //     // Cuando Inicia suele ser mas rapida la respuesta y trae datos viejos
        //     // asi durante el login no ve datos viejos
        //     if (this._dipsUsuarioService.login) {
        //         if (this.usuario.sesion == this._dipsUsuarioService.sesion) { //si es igual finaliza login
        //             this._dipsUsuarioService.login = false;
        //         }

        //     } else {    // analiza sesion

        //         if (this.usuario.sesion !== this._dipsUsuarioService.sesion && !this._dipsUsuarioService.dialogoAbierto) {

        //             this._dipsUsuarioService.dialogoAbierto = true;

        //             // arma mensaje
        //             this.atencionDialogoRef = this._matDialog.open(DipsAtencionDialogComponent, {
        //                 panelClass: 'atencion-dialog',
        //                 disableClose: true,
        //                 data      : {
        //                     titulo: 'Acceso Denegado',
        //                     linea1: '',
        //                     linea2: 'Ha iniciado su cuenta en otro dispositivo.',
        //                     linea3: '',
        //                     botonAceptar: 'Entendido',
        //                     botonCancela: ''
        //                 }

        //             });

        //             // cuando cierra mensaje
        //             this.atencionDialogoRef.afterClosed().subscribe(respuesta => {

        //                 this.saleApp();

        //                 this.atencionDialogoRef = null;
        //                 this._dipsUsuarioService.dialogoAbierto = false;  // permite nuevos dialogos
        //             });
        //         }
        //     }
        // }
    }

}
