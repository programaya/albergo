import { NgModule } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';

import { DipsConfirmDialogComponent } from './confirm-dialog.component';

@NgModule({
    declarations: [
        DipsConfirmDialogComponent
    ],
    imports: [
        MatDialogModule,
        MatButtonModule
    ]
})
export class DipsConfirmDialogModule
{
}

