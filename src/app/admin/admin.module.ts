import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AdminRoutingModule } from './admin-routing.module';

// COMPONENTES
import { ConfigFormComponent } from './config/config.component';

// MATERIAL
// import { MatButtonModule } from '@angular/material/button';
// import { MatChipsModule } from '@angular/material/chips';
// import { MatRippleModule } from '@angular/material/core';
// import { MatExpansionModule } from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatPaginatorModule } from '@angular/material/paginator';
// import { MatPaginatorIntl } from '@angular/material/paginator';
// import { MatSelectModule } from '@angular/material/select';
import { MatSnackBarModule } from '@angular/material/snack-bar';
// import { MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
// import { MatDialogModule } from '@angular/material/dialog';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSelectModule } from '@angular/material/select';

// DIPS
import { DipsSharedModule } from '../../@dips/shared.module';

@NgModule({
  declarations: [
    ConfigFormComponent
  ],
  
  imports: [
    CommonModule,
    AdminRoutingModule,

    // MATERIAL
    // MatButtonModule,
    // MatChipsModule,
    // MatExpansionModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatPaginatorModule,
    // MatRippleModule,
    // MatSelectModule,
    // MatSortModule,
    MatSnackBarModule,
    MatTableModule,
    MatTabsModule,
    // MatDialogModule,
    MatSlideToggleModule,
    MatSelectModule,
 

    // DIPS
    DipsSharedModule,

  ]
})

export class AdminModule { }
