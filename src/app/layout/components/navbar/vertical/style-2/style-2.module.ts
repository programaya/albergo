import { NgModule } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

import { DipsNavigationModule } from '../../../../../../@dips/components';
import { DipsSharedModule } from '../../../../../../@dips/shared.module';

import { NavbarVerticalStyle2Component } from './style-2.component';

@NgModule({
    declarations: [
        NavbarVerticalStyle2Component
    ],
    imports     : [
        MatButtonModule,
        MatIconModule,

        DipsSharedModule,
        DipsNavigationModule
    ],
    exports     : [
        NavbarVerticalStyle2Component
    ]
})
export class NavbarVerticalStyle2Module
{
}
