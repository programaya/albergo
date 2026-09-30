import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

// Material
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatStepperModule } from '@angular/material/stepper';
import { MatRadioModule } from '@angular/material/radio';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';

import { DipsSharedModule } from '../../../@dips/shared.module';

// Componentes
import { PerfilComponent } from './perfil.component';
//import { AvatarComponent } from './avatar/avatar.component';



const routes = [
    {
        path     : '',
        component: PerfilComponent,
        // resolve  : {
        //     profile: ProfileService
        // }
    }
];

@NgModule({
    declarations: [
        PerfilComponent,
//        AvatarComponent,
    ],
    imports     : [
        RouterModule.forChild(routes),

        // Material
        MatButtonModule,
//        MatDividerModule,
        MatIconModule,
//        MatTabsModule,
        MatButtonModule,
        MatFormFieldModule,
        MatIconModule,
        MatInputModule,
        MatSelectModule,
        MatRadioModule,
        MatSlideToggleModule,

//        MatStepperModule,

        DipsSharedModule,
    ],

})
export class PerfilModule
{
}
