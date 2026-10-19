import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableroRoutingModule } from './tablero-routing.module';

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
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatSelectModule } from '@angular/material/select';

// DIPS
import { DipsSharedModule } from '../../../@dips/shared.module';
import { DipsConfirmDialogModule, DipsSidebarModule } from '../../../@dips/components';

// COMPONENTES
import { TableroListComponent } from './tablero-list/tablero-list.component';
import { TableroBaseComponent } from './tablero-base/tablero-base.component';

import { TableroSidebarComponent } from './tablero-sidebars/tablero-sidebars.component';
import { TableroFormDialogComponent } from './tablero-form/tablero-form.component';

import { MatPaginatorPersonal } from '../../../@dips/funciones/dips.paginator';
import { MatRadioModule } from '@angular/material/radio';


@NgModule({
    declarations: [
        TableroBaseComponent,
        TableroSidebarComponent,
        TableroListComponent,
        TableroFormDialogComponent,
        // ContactsComponent,
        TableroFormDialogComponent
    ],
    imports: [
        CommonModule,
        TableroRoutingModule,
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
        MatSnackBarModule,
        MatSelectModule,
        MatRadioModule,
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
export class TableroModule { }
