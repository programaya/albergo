import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FsusuarioRoutingModule } from './fsusuarios-routing.module';

// basedatos
import { AngularFirestoreModule } from '@angular/fire/compat/firestore';

// @matheo/datasiçource
import { FlexLayoutModule } from '@angular/flex-layout';
import { ReactiveFormsModule } from '@angular/forms';
import { MatDataSourceModule } from '@matheo/datasource';

// MATERIAL
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatRippleModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatTableModule } from '@angular/material/table';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatPaginatorIntl } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';

// DIPS
import { DipsSharedModule } from '../../../@dips/shared.module';
import { DipsConfirmDialogModule, DipsSidebarModule } from '../../../@dips/components';

// COMPONENTES
import { FsusuarioListComponent } from './fsusuarios-list/fsusuarios-list.component';
import { FsusuarioBaseComponent } from './fsusuarios-base/fsusuarios-base.component';

import { FsusuarioSidebarComponent } from './fsusuarios-sidebars/fsusuarios-sidebars.component';
import { FsusuarioFormDialogComponent } from './fsusuarios-form/fsusuarios-form.component';

import { MatPaginatorPersonal } from '../../../@dips/funciones/dips.paginator';

@NgModule({
    declarations: [
        FsusuarioBaseComponent,
        FsusuarioSidebarComponent,
        FsusuarioListComponent,
        FsusuarioFormDialogComponent,
    ],
    imports: [
        CommonModule,
        FsusuarioRoutingModule,
        MatButtonModule,
        MatCheckboxModule,
        MatDatepickerModule,
        MatFormFieldModule,
        MatIconModule,
        MatInputModule,
        MatMenuModule,
        MatRippleModule,
        MatTableModule,
        MatToolbarModule,
        MatPaginatorModule,
        MatSortModule,
        MatSlideToggleModule,
        // @matheo/dataSource
        MatDataSourceModule,
        DipsSharedModule,
        DipsConfirmDialogModule,
        DipsSidebarModule
    ],
    providers: [
        { provide: MatPaginatorIntl, useClass: MatPaginatorPersonal },
    ]
})
export class FsusuariosModule
{
}
