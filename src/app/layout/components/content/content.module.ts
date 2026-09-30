import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { DipsSharedModule } from '../../../../@dips/shared.module';

import { ContentComponent } from '../content/content.component';

@NgModule({
    declarations: [
        ContentComponent
    ],
    imports     : [
        RouterModule,
        DipsSharedModule
    ],
    exports     : [
        ContentComponent
    ]
})
export class ContentModule
{
}
