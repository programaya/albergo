import { NgModule } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

import { DipsNavigationModule } from '../../../../../../@dips/components';
import { DipsSharedModule } from '../../../../../../@dips/shared.module';

import { NavbarHorizontalStyle1Component } from '../../horizontal/style-1/style-1.component';

@NgModule({
    declarations: [
        NavbarHorizontalStyle1Component
    ],
    imports     : [
        MatButtonModule,
        MatIconModule,

        DipsSharedModule,
        DipsNavigationModule
    ],
    exports     : [
        NavbarHorizontalStyle1Component
    ]
})
export class NavbarHorizontalStyle1Module
{
}
