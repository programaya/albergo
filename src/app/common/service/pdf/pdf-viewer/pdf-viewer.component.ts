// pdf-viewer.component.ts
import { Component, Input, OnInit, AfterViewInit, ViewChild, ElementRef, PLATFORM_ID, Inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-pdf-viewer',
  standalone: true,
  imports: [MatIconModule],
  template: `
    <div class="pdf-container">
      <div class="controls">
        <button mat-icon-button (click)="prevPage()" [disabled]="pageNum <= 1">
          <mat-icon>navigate_before</mat-icon>
        </button>
        <span class="page-info">Página {{ pageNum }} de {{ totalPages }}</span>
        <button mat-icon-button (click)="nextPage()" [disabled]="pageNum >= totalPages">
          <mat-icon>navigate_next</mat-icon>
        </button>
        <button mat-icon-button (click)="printPdf()">
          <mat-icon>print</mat-icon>
        </button>
      </div>

      <canvas #pdfCanvas id="pdf-canvas"></canvas>

      @if (errorMessage) {
        <p class="error">{{ errorMessage }}</p>
      }
    </div>
  `,
  styles: [`
    .pdf-container {
      display: flex;
      flex-direction: column;
      align-items: center;
    }
    canvas {
      max-width: 100%;
      border: 1px solid #ccc;
      background: white;
    }
    .controls {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-top: 10px;
    }
    .page-info {
      font-size: 14px;
    }
    .error {
      color: red;
    }
  `]
})
export class PdfViewerComponent implements OnInit, AfterViewInit {
  @Input() pdfUrl!: string;
  @ViewChild('pdfCanvas', { static: false }) canvasEl!: ElementRef<HTMLCanvasElement>;
  errorMessage: string | null = null;

  pdf: any = null; // PDF.js PDFDocument
  pageNum = 1;
  totalPages = 0;

  constructor(@Inject(PLATFORM_ID) private platformId: Object) { }

  async ngOnInit() { }

  async ngAfterViewInit() {
    if (isPlatformBrowser(this.platformId)) {
      try {
        const pdfjsLib = await import('pdfjs-dist');
        pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/4.8.69/pdf.worker.min.mjs`;
        await this.loadPdf();
      } catch (error) {
        console.error('Error al cargar PDF.js:', error);
        this.errorMessage = 'Error al inicializar el visor de PDF.';
      }
    }
  }

  async loadPdf() {
    try {
      const pdfjsLib = await import('pdfjs-dist');

      const loadingTask = pdfjsLib.getDocument(this.pdfUrl);
      this.pdf = await loadingTask.promise;

      this.totalPages = this.pdf.numPages;

      console.log('PDF cargado. Número de páginas:', this.totalPages);

      await this.renderPage(this.pageNum);
    } catch (error) {
      console.error('Error al cargar el PDF:', error);
      this.errorMessage = 'No se pudo cargar el PDF. Revisa la consola.';
    }
  }

  async renderPage(pageNum: number) {
    try {
      if (!this.pdf) return;

      const page = await this.pdf.getPage(pageNum);
      const scale = 1.5;
      const viewport = page.getViewport({ scale });

      const canvas = this.canvasEl.nativeElement;
      const context = canvas.getContext('2d')!;
      canvas.height = viewport.height;
      canvas.width = viewport.width;

      const renderContext = { canvasContext: context, viewport: viewport };
      await page.render(renderContext).promise;

      console.log(`Página ${pageNum} renderizada.`);
    } catch (error) {
      console.error(`Error al renderizar la página ${pageNum}:`, error);
      this.errorMessage = `No se pudo renderizar la página ${pageNum}.`;
    }
  }

  async nextPage() {
    if (this.pageNum < this.totalPages) {
      this.pageNum++;
      await this.renderPage(this.pageNum);
    }
  }

  async prevPage() {
    if (this.pageNum > 1) {
      this.pageNum--;
      await this.renderPage(this.pageNum);
    }
  }

  printPdf() {
    if (isPlatformBrowser(this.platformId)) {
      // ✅ Importar print-js dinámicamente solo en el navegador
      import('print-js').then(printJS => {
        const canvas = this.canvasEl.nativeElement;
        const imgData = canvas.toDataURL('image/png');

        printJS.default({
          printable: imgData,
          type: 'image',
          imageStyle: 'width:100%;height:auto;',
          showModal: true,
          modalMessage: 'Generando vista de impresión...'
        });
      }).catch(error => {
        console.error('Error al cargar print-js:', error);
        alert('No se pudo cargar la funcionalidad de impresión.');
      });
    }
  }
}