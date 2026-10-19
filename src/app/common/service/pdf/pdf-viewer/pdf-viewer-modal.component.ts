import { Component, Inject, OnDestroy } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { NgIf } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialogModule } from '@angular/material/dialog';

// Define la interfaz para los datos del diálogo
export interface PdfModalData {
    pdfBlob: Blob;
    title: string;
    fileName: string;
}

@Component({
    selector: 'app-pdf-viewer-modal',
    standalone: true,
    imports: [
        NgIf,
        MatIconModule,
        MatButtonModule,
        MatProgressSpinnerModule,
        MatDialogModule,
    ],
    template: `
    <div class="pdf-modal-header">
      <h2 mat-dialog-title>{{ data.title }}</h2>
      <div class="pdf-modal-actions">
        <button mat-icon-button (click)="print()" title="Imprimir">
          <mat-icon>print</mat-icon>
        </button>
        <button mat-icon-button (click)="download()" title="Descargar">
          <mat-icon>download</mat-icon>
        </button>
        <button mat-icon-button (click)="closeDialog()" title="Cerrar">
          <mat-icon>close</mat-icon>
        </button>
      </div>
    </div>
    
    <mat-dialog-content class="pdf-modal-content">
      <div *ngIf="pdfUrl; else loadingTemplate" class="pdf-container">
        <iframe 
          [src]="pdfUrl" 
          width="100%" 
          height="100%" 
          type="application/pdf"
          class="pdf-iframe">
        </iframe>
      </div>
      
      <ng-template #loadingTemplate>
        <div class="loading-container">
          <mat-spinner></mat-spinner>
          <p>Cargando documento...</p>
        </div>
      </ng-template>
    </mat-dialog-content>
    
    <mat-dialog-actions align="end">
      <button mat-button (click)="closeDialog()">Cerrar</button>
    </mat-dialog-actions>
  `,
    styles: [`
    .pdf-modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px;
      border-bottom: 1px solid rgba(0, 0, 0, 0.12);
    }
    
    .pdf-modal-header h2 {
      margin: 0;
      font-size: 1.2rem;
    }
    
    .pdf-modal-actions {
      display: flex;
      gap: 8px;
    }
    
    .pdf-modal-content {
      padding: 0;
      height: 100%;
    }
    
    .pdf-container {
      width: 100%;
      height: 100%;
    }
    
    .pdf-iframe {
      width: 100%;
      height: 100%;
      border: none;
    }
    
    .loading-container {
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      height: 100%;
      gap: 16px;
    }
    
    .loading-container p {
      margin: 0;
      color: #666;
    }
  `]
})
export class PdfViewerModalComponent implements OnDestroy {
    pdfUrl: SafeResourceUrl | null = null;

    constructor(
        public dialogRef: MatDialogRef<PdfViewerModalComponent>,
        @Inject(MAT_DIALOG_DATA) public data: PdfModalData,
        private sanitizer: DomSanitizer
    ) {
        this.createPdfUrl();
    }

    private createPdfUrl(): void {
        if (this.data.pdfBlob) {
            const url = URL.createObjectURL(this.data.pdfBlob);
            this.pdfUrl = this.sanitizer.bypassSecurityTrustResourceUrl(url);
        }
    }

    download(): void {
        if (this.data.pdfBlob) {
            const url = URL.createObjectURL(this.data.pdfBlob);
            const a = document.createElement('a');
            a.href = url;
            a.download = this.data.fileName;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }
    }

    print(): void {
        if (this.data.pdfBlob) {
            const url = URL.createObjectURL(this.data.pdfBlob);
            const printWindow = window.open('', '_blank');
            if (printWindow) {
                printWindow.document.write(`
          <html>
            <head>
              <title>Imprimir Documento</title>
            </head>
            <body style="margin: 0; padding: 0;">
              <iframe src="${url}" style="width: 100%; height: 100vh; border: none;" onload="window.print();"></iframe>
            </body>
          </html>
        `);
                printWindow.document.close();
            }
            URL.revokeObjectURL(url);
        }
    }

    closeDialog(): void {
        this.dialogRef.close();
    }

    ngOnDestroy(): void {
        if (this.pdfUrl && this.data.pdfBlob) {
            const url = URL.createObjectURL(this.data.pdfBlob);
            URL.revokeObjectURL(url);
        }
    }
}