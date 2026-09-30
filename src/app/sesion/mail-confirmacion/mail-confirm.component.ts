import { Component, OnInit, ViewEncapsulation } from '@angular/core';

import { DipsConfigService } from '../../../@dips/services/config.service';
import { dipsAnimations } from  '../../../@dips/animations';

import { AutentificacionService } from '../autentificacion.service';

// Multi-idiomas
import { DipsTranslationLoaderService } from 'src/@dips/services/translation-loader.service';
import { locale as espanol } from './../i18n/es'; // importar todos los idiomas que se utilicen

@Component({
    selector     : 'mail-confirm',
    templateUrl  : './mail-confirm.component.html',
    styleUrls    : ['./mail-confirm.component.scss'],
    encapsulation: ViewEncapsulation.None,
    animations   : dipsAnimations
})
export class MailConfirmComponent implements OnInit
{

    // Variables
    usuario: any;
    email: any

    /**
     * Constructor
     *
     * @param {DipsConfigService} _dipsConfigService
     */
    constructor(
        private _dipsConfigService: DipsConfigService,
        public _authService: AutentificacionService,
        private _traductor: DipsTranslationLoaderService,
  
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
        this._traductor.loadTranslations(espanol); // ejemplo this._translationLoader.loadTranslations(espanol, turkish);

  
    }

    ngOnInit() {

        this.email = this._authService.confirmaEmail;
    }

}
