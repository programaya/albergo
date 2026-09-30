import { NgModule } from '@angular/core';

import { DipsIfOnDomDirective } from './dips-if-on-dom/dips-if-on-dom.directive';
import { DipsInnerScrollDirective } from './dips-inner-scroll/dips-inner-scroll.directive';
import { DipsPerfectScrollbarDirective } from './dips-perfect-scrollbar/dips-perfect-scrollbar.directive';
import { DipsMatSidenavHelperDirective, DipsMatSidenavTogglerDirective } from './dips-mat-sidenav/dips-mat-sidenav.directive';

// DIPS
import { DipsFileUploaderDirective } from './dips-file-uploader/dips-file-uploader.directive';
import { DipsTabDirective } from './dips-tab/dips-tab-directive';

// Mascaras
import { DipsTelefonoMaskDirective } from './dips-telefono/dips-telefono-Directiva';
import { DipsCuitMaskDirective } from './dips-cuit/dips-cuit-directive';

@NgModule({
    declarations: [
        DipsIfOnDomDirective,
        DipsInnerScrollDirective,
        DipsMatSidenavHelperDirective,
        DipsMatSidenavTogglerDirective,
        DipsPerfectScrollbarDirective,
 
        //DIPS
        DipsFileUploaderDirective,
        DipsTabDirective,

        //Mascaras
        DipsTelefonoMaskDirective,
        DipsCuitMaskDirective
        
    ],
    imports     : [],

    exports     : [
        DipsIfOnDomDirective,
        DipsInnerScrollDirective,
        DipsMatSidenavHelperDirective,
        DipsMatSidenavTogglerDirective,
        DipsPerfectScrollbarDirective,

        // DIPS
        DipsFileUploaderDirective,
        DipsTabDirective,

        // Mascaras
        DipsTelefonoMaskDirective,
        DipsCuitMaskDirective
        
    ]
})
export class DipsDirectivesModule { }
