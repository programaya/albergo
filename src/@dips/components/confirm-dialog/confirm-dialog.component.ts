import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
    selector   : 'dips-confirm-dialog',
    templateUrl: './confirm-dialog.component.html',
    styleUrls  : ['./confirm-dialog.component.scss']
})
export class DipsConfirmDialogComponent
{
    public confirmMessage!: string;

    /**
     * Constructor
     *
     * @param {MatDialogRef<DipsConfirmDialogComponent>} dialogRef
     */
    constructor(
        public dialogRef: MatDialogRef<DipsConfirmDialogComponent>
    ) 
    {
    }

}
