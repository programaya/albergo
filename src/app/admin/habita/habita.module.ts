import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HabitaRoutingModule } from './habita-routing.module';

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

// DIPS
import { DipsSharedModule } from '../../../@dips/shared.module';
import { DipsConfirmDialogModule, DipsSidebarModule } from '../../../@dips/components';

// COMPONENTES
import { HabitaListComponent } from './habita-list/habita-list.component';
import { HabitaBaseComponent } from './habita-base/habita-base.component';

import { HabitaSidebarComponent } from './habita-sidebars/habita-sidebars.component';
import { HabitaFormDialogComponent } from './habita-form/habita-form.component';

import { MatPaginatorPersonal } from '../../../@dips/funciones/dips.paginator';

@NgModule({
    declarations: [
        HabitaBaseComponent,
        HabitaSidebarComponent,
        HabitaListComponent,
        HabitaFormDialogComponent,
        // ContactsComponent,
        HabitaFormDialogComponent
    ],
    imports: [
        CommonModule,
        HabitaRoutingModule,
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
        // @matheo/dataSource
        MatDataSourceModule,
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
export class HabitaModule {
}
