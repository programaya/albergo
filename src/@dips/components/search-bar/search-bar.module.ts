import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

import { DipsSearchBarComponent } from './search-bar.component';

@NgModule({
    declarations: [
        DipsSearchBarComponent
    ],
    imports     : [
        CommonModule,
        RouterModule,

        MatButtonModule,
        MatIconModule
    ],
    exports     : [
        DipsSearchBarComponent
    ]
})
export class DipsSearchBarModule
{
}
