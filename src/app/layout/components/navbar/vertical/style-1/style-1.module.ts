import { NgModule } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

import { DipsNavigationModule } from '../../../../../../@dips/components';
import { DipsSharedModule } from '../../../../../../@dips/shared.module';

import { NavbarVerticalStyle1Component } from './style-1.component';

@NgModule({
    declarations: [
        NavbarVerticalStyle1Component
    ],
    imports     : [
        MatButtonModule,
        MatIconModule,

        DipsSharedModule,
        DipsNavigationModule
    ],
    exports     : [
        NavbarVerticalStyle1Component
    ]
})
export class NavbarVerticalStyle1Module
{
}
