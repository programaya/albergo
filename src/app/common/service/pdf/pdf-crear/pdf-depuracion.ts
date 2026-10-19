import { inject, Injectable } from '@angular/core';
import { PDFPage, rgb, StandardFonts } from 'pdf-lib';
import { mm2pt, pt2mm } from './utils/page-size';
import { EstructuraJSON } from './models/json-estructura.model';
import { ElementosPDFService } from './pdf-elementos';

@Injectable({
  providedIn: 'root',
})
export class DepuracionPDFService {

  #elementos = inject(ElementosPDFService);

  constructor() { }

  async depuracion(estructura: EstructuraJSON, page: PDFPage): Promise<void> {

    // Dibujar reglas
    await this.dibujarReglas(page, {
      intervaloMm: 10,
      color: [0.4, 0.4, 0.4],
      mostrarCuadricula: true
    });

    // Dibujar zonas
    this.dibujarDivisionesZonas(page, {
      zona: 'encabezado',
      alto: estructura.general.alturaEncabezado,
      color: [0, 0, 1], // azul
      grosor: 1
    });

    this.dibujarDivisionesZonas(page, {
      zona: 'pie',
      alto: estructura.general.alturaPie,
      color: [1, 0, 0], // rojo
      grosor: 1
    });
  }


  // ———————————————————————————————————————————————————————
  // 📐 Reglas solo para diseño, regla X / Y
  // ———————————————————————————————————————————————————————

  async dibujarReglas(
    page: PDFPage,
    options: {
      intervaloMm?: number;
      color?: [number, number, number]; // [r,g,b] en [0,1]
      grosor?: number;
      mostrarCuadricula?: boolean;
    } = {}
  ): Promise<void> {

    // ✅ Guardia temprana
    if (!page) {
      console.warn('⚠️ No se puede dibujar reglas: page es undefined');
      return;
    }

    const {
      intervaloMm = 10,
      color = [0.8, 0.8, 0.8], // gris claro
      grosor = 0.5,
      mostrarCuadricula = true
    } = options;

    const intervaloPx = options.intervaloMm ? mm2pt(options.intervaloMm) : 50;

    const { width, height } = page.getSize();

    // ✏️ Configurar fuente para etiquetas (usa Helvetica, built-in)
    const font = page.doc.embedStandardFont(StandardFonts.Helvetica);

    // ———————————————————————————————————————————————————————
    // 📏 Regla X (superior)
    // ———————————————————————————————————————————————————————
    for (let x = 0; x <= width; x += intervaloPx) {
      // Línea vertical (marca)
      page.drawLine({
        start: { x, y: height - 10 },
        end: { x, y: height - 5 },
        color: rgb(...color),
        thickness: grosor
      });

      // Etiqueta de número
      if (x > 0) {
        page.drawText(pt2mm(x).toString(), {
          x: x - 6,
          y: height - 22,
          size: 8,
          color: rgb(...color),
          font
        });
      }
    }

    // Línea base de la regla X
    page.drawLine({
      start: { x: 0, y: height - 10 },
      end: { x: width, y: height - 10 },
      color: rgb(...color),
      thickness: grosor
    });

    // ———————————————————————————————————————————————————————
    // 📏 Regla Y (izquierda)
    // ———————————————————————————————————————————————————————
    for (let y = 0; y <= height; y += intervaloPx) {
      // Línea horizontal (marca)
      page.drawLine({
        start: { x: 0, y: height - y },
        end: { x: 5, y: height - y },
        color: rgb(...color),
        thickness: grosor
      });

      // Etiqueta de número
      if (y > 0) {
        page.drawText(pt2mm(y).toString(), {
          x: 8,
          y: height - y - 4,
          size: 8,
          color: rgb(...color),
          font
        });
      }
    }

    // Línea base de la regla Y
    page.drawLine({
      start: { x: 0, y: 0 },
      end: { x: 0, y: height },
      color: rgb(...color),
      thickness: grosor
    })

    // ———————————————————————————————————————————————————————
    // 🟦 Cuadrícula (muy tenue)
    // ———————————————————————————————————————————————————————
    if (mostrarCuadricula) {
      const gridColor: [number, number, number] = [0.28, 0.4, 0.16];
      //const gridColor = [0.95, 0.95, 0.95]; // casi blanco
      for (let x = intervaloPx; x < width; x += intervaloPx) {
        page.drawLine({
          start: { x, y: 0 },
          end: { x, y: height },
          color: rgb(...gridColor),
          thickness: 0.25,
          opacity: 0.3
        });
      }
      for (let y = intervaloPx; y < height; y += intervaloPx) {
        page.drawLine({
          start: { x: 0, y: height - y },
          end: { x: width, y: height - y },
          color: rgb(...gridColor),
          thickness: 0.25,
          opacity: 0.3
        });
      }
    }
  }


  // ———————————————————————————————————————————————————————
  // 📐 Dibujar Zonas
  // ———————————————————————————————————————————————————————

  dibujarDivisionesZonas(
    page: PDFPage,
    opciones: {
      zona?: string,
      alto?: number,
      color?: [number, number, number];
      grosor?: number;
    } = {}
  ): void {
    const {
      zona = '',
      alto = 100,
      color = [1, 0, 0], // rojo por defecto
      grosor = 1
    } = opciones;

    if (zona === 'encabezado') {
      const pageWidth = page.getWidth();
      const pageHeight = page.getHeight();
      const altura = mm2pt(alto);

      // Línea inferior del encabezado
      this.dibujarLineaHorizontalTrazos(
        page,
        pageHeight - altura,
        0,
        pageWidth,
        {
          color,
          grosor,
          dashArray: [4, 3],
          dashPhase: 0
        }
      );

      // Etiqueta "Encabezado"
      const font = page.doc.embedStandardFont(StandardFonts.HelveticaBold);
      page.drawText('Encabezado', {
        x: 5,
        y: pageHeight - altura + 5,
        size: 10,
        color: rgb(...color),
        font
      });
    } else if (zona === 'cuerpo') {
      // Similar para cuerpo...
    } else if (zona === 'pie') {
      const pageWidth = page.getWidth();
      const pageHeight = page.getHeight();
      const altura = mm2pt(alto);

      // Línea inferior 
      this.dibujarLineaHorizontalTrazos(
        page,
        altura,
        0,
        pageWidth,
        {
          color,
          grosor,
          dashArray: [4, 3],
          dashPhase: 0
        }
      );

      // Etiqueta "Pie"
      const font = page.doc.embedStandardFont(StandardFonts.HelveticaBold);
      page.drawText('Pie', {
        x: 5,
        y: altura - 8,
        size: 10,
        color: rgb(...color),
        font
      });
    }
  }

  /**
 * Dibuja una línea horizontal de trazos en una posición Y fija
 * @param page La página PDF donde dibujar
 * @param y Posición Y (en puntos)
 * @param x1 Inicio X (puntos)
 * @param x2 Fin X (puntos)
 * @param options Opciones de estilo
 */
  dibujarLineaHorizontalTrazos(
    page: PDFPage,
    y: number,
    x1: number,
    x2: number,
    options: {
      color?: [number, number, number];
      grosor?: number;
      dashArray?: number[];
      dashPhase?: number;
    } = {}
  ): void {
    const {
      color = [0, 0, 0],
      grosor = 1,
      dashArray = [5, 2], // trazo 4pt, espacio 3pt
      dashPhase = 0
    } = options;

    page.drawLine({
      start: { x: x1, y },
      end: { x: x2, y },
      color: rgb(...color),
      thickness: grosor,
      dashArray,
      dashPhase
    });
  }

}