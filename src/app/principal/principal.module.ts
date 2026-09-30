import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { PrincipalRoutingModule } from './principal-routing.module';

// DIPS
import { DipsSharedModule } from '../../@dips/shared.module';
//import { InicioBaseComponent } from  './inicio/inicio-base/inicio-base.component'


@NgModule({
    imports     : [
        CommonModule,
        PrincipalRoutingModule,

        // DIPS
        DipsSharedModule,

    ],
//    declarations: [InicioBaseComponent]
})
export class PrincipalModule
{
}
