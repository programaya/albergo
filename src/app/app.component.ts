import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { Platform } from '@angular/cdk/platform';
import { TranslateService } from '@ngx-translate/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { DipsConfigService } from '../@dips/services/config.service';
import { DipsNavigationService } from 'src/@dips/components/navigation/navigation.service';
import { DipsSidebarService } from 'src/@dips/components/sidebar/sidebar.service';
import { DipsSplashScreenService } from 'src/@dips/services/splash-screen.service';
import { DipsTranslationLoaderService } from 'src/@dips/services/translation-loader.service';

import { navigation } from './navigation/navigation';
import { locale as navigationEnglish } from './navigation/i18n/en';
import { locale as navigationEspanol } from './navigation/i18n/es';

import { AutentificacionService } from './sesion/autentificacion.service';

import { ActivatedRoute } from '@angular/router'; 
import { DipsAppUpdateService } from 'src/@dips/services/pwaupgrade/pwa-upgrade.service';

@Component({
    selector   : 'app-root',
    templateUrl: './app.component.html',
    styleUrls  : ['./app.component.scss']
})
export class AppComponent implements OnInit, OnDestroy
{
    dipsConfig: any;
    navigation: any;

    // Private
    private _unsubscribeAll: Subject<any>;

    /**
     * Constructor
     *
     */
    constructor(
        @Inject(DOCUMENT) private document: any,
        private _dipsConfigService: DipsConfigService,
        private _dipsNavigationService: DipsNavigationService,
        private _dipsSidebarService: DipsSidebarService,
        private _dipsSplashScreenService: DipsSplashScreenService,
        private _dipsTranslationLoaderService: DipsTranslationLoaderService,
        private _translateService: TranslateService,
        private _platform: Platform,
        private _autentificaService: AutentificacionService,
        private _rutaActiva: ActivatedRoute,
        private _pwaUpgrade: DipsAppUpdateService,


    )
    {

        // LECTURA DE PARAMETROS INICIALES AUN EN PRUEBA
        // ++++++++++++++++++++++++++++++++++++++++++++++++++++
        // ++++++++++++++++++++++++++++++++++++++++++++++++++++++

        // AUN NO SE PARA QUE OCUPARLAS 

        this._rutaActiva.queryParams.subscribe(params => {

            // console.log('proceso 2')
            // console.log(params['name']);
            // console.log(params['type']);
            // console.log(params['toto']);
        });
    
        // Get the parameters, using queryParamMap
        this._rutaActiva.queryParamMap.subscribe((data: any) => {
            const params = data['params'];
            // console.log('proceso 1')
            // console.log(params['name']);
            // console.log(params['type']);
            // console.log(params['toto']);
        });
// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++



        // Cierra cualquier sesion previa abierta
        this._autentificaService.userFinSesion();

        // Get default navigation
        this.navigation = navigation;

        // Register the navigation to the service
        this._dipsNavigationService.register('main', this.navigation);

        // Set the main navigation as our current navigation
        this._dipsNavigationService.setCurrentNavigation('main');

        // Add languages
        this._translateService.addLangs(['en', 'es']);

        // Set the default language
        this._translateService.setDefaultLang('es');

        // Set the navigation translations
        this._dipsTranslationLoaderService.loadTranslations(navigationEnglish, navigationEspanol);

        // Use a language
        this._translateService.use('es');
        
        this._pwaUpgrade.checkForUpdates()
       
        /**
         * ----------------------------------------------------------------------------------------------------
         * ngxTranslate Fix Start
         * ----------------------------------------------------------------------------------------------------
         */

        /**
         * If you are using a language other than the default one, i.e. Español in this case,
         * you may encounter an issue where some of the components are not actually being
         * translated when your app first initialized.
         *
         * This is related to ngxTranslate module and below there is a temporary fix while we
         * are moving the multi language implementation over to the Angular's core language
         * service.
         **/

        // Set the default language to 'en' and then back to 'es'.
        // '.use' cannot be used here as ngxTranslate won't switch to a language that's already
        // been selected and there is no way to force it, so we overcome the issue by switching
        // the default language back and forth.
        /**
         setTimeout(() => {
            this._translateService.setDefaultLang('en');
            this._translateService.setDefaultLang('es');
         });
         */

        /**
         * ----------------------------------------------------------------------------------------------------
         * ngxTranslate Fix End
         * ----------------------------------------------------------------------------------------------------
         */

        // Add is-mobile class to the body if the platform is mobile
        if ( this._platform.ANDROID || this._platform.IOS )
        {
            this.document.body.classList.add('is-mobile');
        }

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
        // Subscribe to config changes
        this._dipsConfigService.config
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((config: any) => {

                this.dipsConfig = config;

                // Boxed
                if ( this.dipsConfig.layout.width === 'boxed' )
                {
                    this.document.body.classList.add('boxed');
                }
                else
                {
                    this.document.body.classList.remove('boxed');
                }

                // Color theme - Use normal for loop for IE11 compatibility
                for ( let i = 0; i < this.document.body.classList.length; i++ )
                {
                    const className = this.document.body.classList[i];

                    if ( className.startsWith('theme-') )
                    {
                        this.document.body.classList.remove(className);
                    }
                }

                this.document.body.classList.add(this.dipsConfig.colorTheme);
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

}
