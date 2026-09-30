import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CajaRoutingModule } from './caja-routing.module';

// basedatos
import { AngularFirestoreModule } from '@angular/fire/compat/firestore';

// @matheo/dataSource
import { FlexLayoutModule } from '@angular/flex-layout';
import { ReactiveFormsModule } from '@angular/forms';
import { MatDataSourceModule } from '@matheo/datasource';


// COMPONENTES
import { CajaListComponent } from './caja-list/caja-list.component';
import { CajaFormComponent } from './caja-form/caja-form.component';
import { CajaBaseComponent } from './caja-base/caja-base.component';
import { CajaMovDialogComponent } from './caja-mov/caja-mov.component';

// MATERIAL
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatRippleModule } from '@angular/material/core';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatPaginatorIntl } from '@angular/material/paginator';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { MatDialogModule } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatToolbarModule } from '@angular/material/toolbar';


import { MatPaginatorPersonal } from '../../../@dips/funciones/dips.paginator';

// ************************* ANALIZAR ********************************
// import { NgxChartsModule } from '@swimlane/ngx-charts';
// import { AgmCoreModule } from '@agm/core';

// DIPS
import { DipsSharedModule } from '../../../@dips/shared.module';
import { DipsWidgetModule } from '../../../@dips/components/widget/widget.module';
import { DipsConfirmDialogModule } from '../../../@dips/components';

@NgModule({
  declarations: [
    CajaListComponent, 
    CajaFormComponent, 
    CajaBaseComponent,
    CajaMovDialogComponent
  ],

  imports: [
    CommonModule,
    CajaRoutingModule,

        // MATERIAL
        MatButtonModule,
        MatChipsModule,
        MatExpansionModule,
        MatFormFieldModule,
        MatIconModule,
        MatInputModule,
        MatPaginatorModule,
        MatRippleModule,
        MatSelectModule,
        MatSortModule,
        MatSnackBarModule,
        MatTableModule,
        MatTabsModule,
        MatDialogModule,
        MatTooltipModule,
        MatDatepickerModule,
        MatToolbarModule,

        // @matheo/dataSource
        MatDataSourceModule,

        AngularFirestoreModule,
        FlexLayoutModule,
        ReactiveFormsModule,
    
        // ************** ANALIZAR ************
        // NgxChartsModule,
        // AgmCoreModule.forRoot({
        //     apiKey: 'AIzaSyD81ecsCj4yYpcXSLFcYU97PvRsE_X8Bx8'
        // }),
    
        // DIPS
        DipsSharedModule,
        DipsWidgetModule,
        DipsConfirmDialogModule
    
        
  ],

  providers: [
    { provide: MatPaginatorIntl, useClass: MatPaginatorPersonal},

  ],

})
export class CajaModule { }

