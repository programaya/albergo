import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

import { FlexLayoutModule } from '@angular/flex-layout';

import { DipsDirectivesModule } from './directives/directives';
import { DipsPipesModule } from './pipes/pipes.module';

@NgModule({
    imports  : [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,

        FlexLayoutModule,

        DipsDirectivesModule,
        DipsPipesModule
    ],
    exports  : [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,

        FlexLayoutModule,

        DipsDirectivesModule,
        DipsPipesModule
    ]
})
export class DipsSharedModule { }
