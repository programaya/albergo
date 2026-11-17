import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { DetalleArqueoComponent } from './detalle-arqueo.component';

@NgModule({
  declarations: [DetalleArqueoComponent],
  imports: [CommonModule, MatButtonModule, MatDialogModule, MatIconModule],
  exports: [DetalleArqueoComponent]
})
export class DetalleArqueoModule { }
