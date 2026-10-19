import { Injectable, inject } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { PdfViewerModalComponent, PdfModalData } from './pdf-viewer-modal.component';

@Injectable({
    providedIn: 'root'
})
export class PdfModalService {
    private dialog = inject(MatDialog);

    /**
     * Mostrar PDF en un modal
     * @param pdfBlob - El Blob PDF generado
     * @param title - Título del modal
     * @param fileName - Nombre del archivo para descarga
     */
    showPdfModal(pdfBlob: Blob, title: string = 'Vista Previa del Documento', fileName: string = 'documento.pdf') {
        const config: MatDialogConfig = {
            width: '90%',
            height: '90%',
            maxWidth: '1200px',
            maxHeight: '800px',
            data: {
                pdfBlob: pdfBlob,
                title: title,
                fileName: fileName
            },
            panelClass: 'pdf-modal-panel'
        };

        const dialogRef = this.dialog.open(PdfViewerModalComponent, config);
        return dialogRef;
    }
}