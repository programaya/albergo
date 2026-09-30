import { NgModule } from '@angular/core';

import { DipsSharedModule } from '../../../../@dips/shared.module';

import { NavbarComponent } from './navbar.component';
import { NavbarHorizontalStyle1Module } from './horizontal/style-1/style-1.module';
import { NavbarVerticalStyle1Module } from './vertical/style-1/style-1.module';
import { NavbarVerticalStyle2Module } from './vertical/style-2/style-2.module';
import { DipsAtencionDialogModule } from '../../../../@dips/components';

@NgModule({
    declarations: [
        NavbarComponent
    ],
    imports     : [
        DipsSharedModule,

        NavbarHorizontalStyle1Module,
        NavbarVerticalStyle1Module,
        NavbarVerticalStyle2Module,

        DipsAtencionDialogModule
    ],
    exports     : [
        NavbarComponent
    ]
})
export class NavbarModule
{
}
