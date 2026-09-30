import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PromoRoutingModule } from './promo-routing.module';

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
import { MatSelectModule } from '@angular/material/select';

// DIPS
import { DipsSharedModule } from '../../../@dips/shared.module';
import { DipsConfirmDialogModule, DipsSidebarModule } from '../../../@dips/components';

// COMPONENTES
import { PromoListComponent } from './promo-list/promo-list.component';
import { PromoBaseComponent } from './promo-base/promo-base.component';

import { PromoSidebarComponent } from './promo-sidebars/promo-sidebars.component';
import { PromoFormDialogComponent } from './promo-form/promo-form.component';

import { MatPaginatorPersonal } from '../../../@dips/funciones/dips.paginator';

import { NgxSliderModule } from '@angular-slider/ngx-slider';


@NgModule({
    declarations: [
        PromoBaseComponent,
        PromoSidebarComponent,
        PromoListComponent,
        PromoFormDialogComponent,
        // ContactsComponent,
        PromoFormDialogComponent
    ],
    imports: [
        CommonModule,
        PromoRoutingModule,
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
        NgxSliderModule,
        MatSlideToggleModule,
        MatSelectModule,
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
export class PromoModule
{
}
