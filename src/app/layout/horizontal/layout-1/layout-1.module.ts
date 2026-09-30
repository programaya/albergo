import { NgModule } from '@angular/core';
import { MatSidenavModule } from '@angular/material/sidenav';

import { DipsSidebarModule, DipsThemeOptionsModule } from '../../../../@dips/components';
import { DipsSharedModule } from '../../../../@dips/shared.module';

import { ContentModule } from '../../components/content/content.module';
import { FooterModule } from '../../components/footer/footer.module';
import { NavbarModule } from '../../components/navbar/navbar.module';
import { QuickPanelModule } from '../../components/quick-panel/quick-panel.module';
import { ToolbarModule } from '../../components/toolbar/toolbar.module';

import { HorizontalLayout1Component } from '../../horizontal/layout-1/layout-1.component';

@NgModule({
    declarations: [
        HorizontalLayout1Component
    ],
    imports     : [
        MatSidenavModule,

        DipsSharedModule,
        DipsSidebarModule,
        DipsThemeOptionsModule,

        ContentModule,
        FooterModule,
        NavbarModule,
        QuickPanelModule,
        ToolbarModule
    ],
    exports     : [
        HorizontalLayout1Component
    ]
})
export class HorizontalLayout1Module
{
}
