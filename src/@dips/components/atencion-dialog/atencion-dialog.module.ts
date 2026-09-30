import { NgModule } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';

import { DipsAtencionDialogComponent } from './atencion-dialog.component';

@NgModule({
    declarations: [
        DipsAtencionDialogComponent
    ],
    imports: [
        MatDialogModule,
        MatButtonModule,
        MatIconModule,
        MatToolbarModule
    ]
})
export class DipsAtencionDialogModule {}
