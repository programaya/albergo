import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { DipsSidebarModule } from '../../../../@dips/components/index';
import { DipsSharedModule } from '../../../../@dips/shared.module';

import { ContentModule } from '../../components/content/content.module';
import { FooterModule } from '../../components/footer/footer.module';
import { NavbarModule } from '../../components/navbar/navbar.module';
import { QuickPanelModule } from '../../components/quick-panel/quick-panel.module';
import { ToolbarModule } from '../../components/toolbar/toolbar.module';

import { VerticalLayout3Component } from '../../vertical/layout-3/layout-3.component';

@NgModule({
    declarations: [
        VerticalLayout3Component
    ],
    imports     : [
        RouterModule,

        DipsSharedModule,
        DipsSidebarModule,

        ContentModule,
        FooterModule,
        NavbarModule,
        QuickPanelModule,
        ToolbarModule
    ],
    exports     : [
        VerticalLayout3Component
    ]
})
export class VerticalLayout3Module
{
}
