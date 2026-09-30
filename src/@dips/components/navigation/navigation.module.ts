import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatRippleModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';

import { TranslateModule } from '@ngx-translate/core';

import { DipsNavigationComponent } from './navigation.component';
import { DipsNavVerticalItemComponent } from './vertical/item/item.component';
import { DipsNavVerticalCollapsableComponent } from './vertical/collapsable/collapsable.component';
import { DipsNavVerticalGroupComponent } from './vertical/group/group.component';
import { DipsNavHorizontalItemComponent } from './horizontal/item/item.component';
import { DipsNavHorizontalCollapsableComponent } from './horizontal/collapsable/collapsable.component';

@NgModule({
    imports     : [
        CommonModule,
        RouterModule,

        MatIconModule,
        MatRippleModule,

        TranslateModule.forChild()
    ],
    exports     : [
        DipsNavigationComponent
    ],
    declarations: [
        DipsNavigationComponent,
        DipsNavVerticalGroupComponent,
        DipsNavVerticalItemComponent,
        DipsNavVerticalCollapsableComponent,
        DipsNavHorizontalItemComponent,
        DipsNavHorizontalCollapsableComponent
    ]
})
export class DipsNavigationModule
{
}
