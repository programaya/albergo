import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';

import { DipsSharedModule } from '../../../../@dips/shared.module';

import { FooterComponent } from '../footer/footer.component';

@NgModule({
    declarations: [
        FooterComponent
    ],
    imports     : [
        RouterModule,

        MatButtonModule,
        MatIconModule,
        MatToolbarModule,

        DipsSharedModule
    ],
    exports     : [
        FooterComponent
    ]
})
export class FooterModule
{
}
