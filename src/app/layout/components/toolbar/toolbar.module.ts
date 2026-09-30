import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatToolbarModule } from '@angular/material/toolbar';

import { DipsSearchBarModule, DipsShortcutsModule } from 'src/@dips/components';
import { DipsSharedModule } from '../../../../@dips/shared.module';

import { ToolbarComponent } from './toolbar.component';

@NgModule({
    declarations: [
        ToolbarComponent
    ],
    imports     : [
        RouterModule,
        MatButtonModule,
        MatIconModule,
        MatMenuModule,
        MatToolbarModule,

        DipsSharedModule,
        DipsSearchBarModule,
        DipsShortcutsModule,
    ],
    exports     : [
        ToolbarComponent
    ]
})
export class ToolbarModule
{
}
