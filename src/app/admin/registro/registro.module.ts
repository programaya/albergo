import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RegistroRoutingModule } from './registro-routing.module';

// basedatos
import { AngularFirestoreModule } from '@angular/fire/compat/firestore';

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

// DIPS
import { DipsSharedModule } from '../../../@dips/shared.module';
import { DipsConfirmDialogModule, DipsSidebarModule } from '../../../@dips/components';

// COMPONENTES
import { RegistroListComponent } from './registro-list/registro-list.component';
import { RegistroBaseComponent } from './registro-base/registro-base.component';

import { RegistroSidebarComponent } from './registro-sidebars/registro-sidebars.component';
import { RegistroFormDialogComponent } from './registro-form/registro-form.component';

import { MatPaginatorPersonal } from '../../../@dips/funciones/dips.paginator';

@NgModule({
    declarations: [
        RegistroBaseComponent,
        RegistroSidebarComponent,
        RegistroListComponent,
        RegistroFormDialogComponent,
        RegistroFormDialogComponent
    ],
    imports: [
        CommonModule,
        RegistroRoutingModule,
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
        DipsSharedModule,
        DipsConfirmDialogModule,
        DipsSidebarModule
    ],
    providers: [
        {
            provide: MatPaginatorIntl,
            useClass: MatPaginatorPersonal
        },
    ]
})
export class RegistroModule {
}
