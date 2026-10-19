// pdf.service.ts
import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { NgxIndexedDBService } from 'ngx-indexed-db';

declare var jsPDF: any;
declare var html2canvas: any;

@Injectable({
  providedIn: 'root'
})
export class PdfService {
  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private _dbService: NgxIndexedDBService
  ) {}

  /**
   * Genera un PDF a partir de una plantilla HTML y datos de IndexedDB
   * @param templateId ID del elemento HTML a convertir en PDF
   * @param tipo Tipo de informe (ej. 'clientes', 'productos')
   */
  async generarPdfDesdeVista(templateId: string, tipo: string) {
    if (!isPlatformBrowser(this.platformId)) {
      console.warn('PDF no generado: no disponible en SSR.');
      return;
    }

    try {
      // Leer datos de IndexedDB
 //     const data = await this._dbService.obtenerDatos(tipo);

      // Obtener el HTML del contenedor
      const content = document.getElementById(templateId);
      if (!content) {
        throw new Error('No se encontró el contenedor para generar el PDF.');
      }

      // Reemplazar marcadores en el HTML
  //    const html = this.reemplazarMarcadores(content.innerHTML, data);

      // Crear un contenedor temporal para el HTML con los datos reemplazados
      const tempDiv = document.createElement('div');
//      tempDiv.innerHTML = html;
      tempDiv.style.position = 'absolute';
      tempDiv.style.left = '-9999px';
      document.body.appendChild(tempDiv);

      // Generar el PDF
      const canvas = await html2canvas(tempDiv);
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgWidth = 210; // ancho A4 en mm
      const pageHeight = 295;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      // Limpiar el contenedor temporal
      document.body.removeChild(tempDiv);

      // Abrir en nueva pestaña o descargar
      pdf.output('dataurlnewwindow');
    } catch (error) {
      console.error('Error al generar el PDF:', error);
    }
  }

  private reemplazarMarcadores(html: string, data: any): string {
    let result = html;
    const matches = result.match(/\{\{([^}]+)\}\}/g);

    if (matches) {
      matches.forEach((match) => {
        const key = match.replace(/\{\{|\}\}/g, '').trim();
        const value = this.obtenerValor(data, key);
        result = result.replace(new RegExp(match, 'g'), value || '');
      });
    }

    return result;
  }

  private obtenerValor(obj: any, path: string): any {
    return path.split('.').reduce((acc, part) => acc && acc[part], obj);
  }
}