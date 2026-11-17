import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSortModule } from '@angular/material/sort';
import { MatPaginatorModule, MatPaginatorIntl } from '@angular/material/paginator';
import { MatPaginatorPersonal } from '../../../@dips/funciones/dips.paginator';
import { DetalleArqueoModule } from '../../principal/caja/arqueo/detalle-arqueo/detalle-arqueo.module';
import { RegistroRoutingModule } from './registro-routing.module';
import { RegistroComponent } from './registro.component';

@NgModule({
  declarations: [RegistroComponent],
  imports: [CommonModule, FormsModule, RegistroRoutingModule, MatButtonModule,
    MatDialogModule, MatIconModule, MatFormFieldModule, MatInputModule,
    MatPaginatorModule, MatSortModule, DetalleArqueoModule],
  providers: [{ provide: MatPaginatorIntl, useClass: MatPaginatorPersonal }]
})
export class RegistroModule { }
