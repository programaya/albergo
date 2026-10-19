import { inject, Injectable } from '@angular/core';
import { PDFPage, rgb, StandardFonts, Color, PDFDocument } from 'pdf-lib';
import { mm2pt, pt2mm, NAMED_COLORS } from './utils/page-size';
import { EstructuraJSON, RamaColumna, TroncoGeneral, TroncoTabla } from './models/json-estructura.model';
import { PdfImageService } from '@serv/bajaImagen/pdfImage.service';
import { firstValueFrom, Observable } from 'rxjs';


@Injectable({
  providedIn: 'root',
})
export class ElementosPDFService {

  // paginacion
  itemsPorPagina = 10;
  itemActual = 0;
  paginaActual = 1;
  totalPaginas = 1;
  totalItems = 0;

  // Datos para Ticket
  esTicket = false;
  ticketPieReferencia = 0;
  ticketPie = 0;

  constructor(
    private _pdfImageService: PdfImageService
  ) { }

  async armadoElementos(
    estructura: TroncoGeneral | RamaColumna,
    page: PDFPage,
    pdfDoc: PDFDocument,
    dataPDF?: any,
    opciones?: {
      tabla?: TroncoTabla,
      xPosicion?: number,
      fila?: number,
      renglon?: number
    }): Promise<void> {

    const { tabla, xPosicion, fila, renglon } = opciones || {};

    if (estructura.elementos) {
      // 1. Ordenar los Elementos por orden
      await this._ordenarEstructura(estructura);

      // 2. Procesar los elementos
      for (const elemento of estructura.elementos) {

        switch (elemento.tipo) {
          case 'texto':
            await this.renderizarTexto(page, elemento, tabla, fila, renglon, dataPDF);
            break;
          case 'numero':
            await this.renderizarNumero(page, elemento, tabla, xPosicion, fila, renglon, dataPDF);
            break;
          case 'fecha':
            await this.renderizarFecha(page, elemento, tabla, fila, renglon, dataPDF);
            break;
          case 'linea':
            await this.renderizarLinea(page, elemento);
            break;
          case 'rectangulo':
            await this.renderizarRectangulo(page, elemento);
            break;
          case 'imagen':
            await this.renderizarImagen(page, elemento, pdfDoc, tabla, fila, dataPDF);
            break;
        }

      }
    }

  }

  // Función auxiliar para ordenar un array de elementos por el campo 'orden'
  private async _ordenarElementos(elementos: any[]): Promise<void> {
    if (!elementos || !Array.isArray(elementos)) {
      return;
    }

    elementos.sort((a, b) => {
      const ordenA = a.orden !== undefined ? a.orden : Number.MAX_SAFE_INTEGER;
      const ordenB = b.orden !== undefined ? b.orden : Number.MAX_SAFE_INTEGER;
      return ordenA - ordenB;
    });
  }

  // Función principal para ordenar recursivamente todos los elementos en la estructura
  private async _ordenarEstructura(estructura: any): Promise<void> {
    // Si tiene elementos, los ordenamos
    if (estructura.elementos && Array.isArray(estructura.elementos)) {
      this._ordenarElementos(estructura.elementos);
    }
  }

  async renderizarTexto(page: PDFPage, elemento: any, tabla?: TroncoTabla, fila: number = 0, renglon: number = 0, dataPDF?: any): Promise<void> {

    let yElemento = elemento.y; // cambia se esta en tabla o en general

    // si es ticket y el elemento esta por debajo del ticketPieReferencia
    if (this.esTicket && this.ticketPieReferencia < elemento.y) {
      const diferencia = elemento.y - this.ticketPieReferencia;
      yElemento = this.ticketPie + diferencia;
    }

    const width = page.getWidth();
    const height = page.getHeight();
    const { dato, fuente, tamanoFuente, color, ancho } = elemento;

    if (tabla) {

      // 1. Medir texto para alineación
      const font = await page.doc.embedFont(fuente || StandardFonts.Helvetica);
      const textHeight = pt2mm(font.heightAtSize(tamanoFuente || 10));

      // 2. Calcular posición Y centrada en el alto de la fila
      const baseTexto = (tabla.alturaFila - textHeight) / 2
      yElemento = tabla.y + tabla.alturaFila + (tabla.alturaFila * renglon) - baseTexto

    }

    const x = mm2pt(elemento.x);
    const y = height - mm2pt(yElemento)

    if (!dato || dato.trim() === '') {
      console.warn('El contenido del texto está vacío. No se dibujará nada.');
      return;
    }

    // Dato de Texto
    let textoAjustado = dato

    if (dataPDF) {    // en produccion
      textoAjustado = this.reemplazarMarcadores(dato, dataPDF, fila);

      console.log("Texto reemplazado:", textoAjustado)

      if (elemento.longitud && elemento.longitud > 0) {

        if (textoAjustado.length > elemento.longitud) {
          textoAjustado = textoAjustado.substring(0, elemento.longitud);
        }
      }

    } else {      // en diseño
      if (this._tieneMarcador(textoAjustado)) {
        textoAjustado = this._generarCaracteres(elemento.longitud || 20, 'X');
      }
    }

    page.drawText(textoAjustado, {
      x: x,
      y: y,
      size: tamanoFuente,
      font: await page.doc.embedFont(fuente || StandardFonts.Helvetica),
      color: this.toPdfColor(color),
    });
  }

  async renderizarNumero(page: PDFPage, elemento: any, tabla?: TroncoTabla, xPosicion?: number, fila: number = 0, renglon: number = 0, dataPDF?: any): Promise<void> {

    const width = page.getWidth();
    const height = page.getHeight();
    let { dato,
      fuente,
      tamanoFuente,
      color,
      colorNegativo } = elemento;

    // 1. Validar valor numérico
    if (!dataPDF) { // Llamado desde diseño
      if (this._tieneMarcador(dato)) {
        dato = 0 // forzar 0 en diseño si hay marcador
      }

    } else {
      // Aplicar reemplazo de marcadores para obtener la cadena final
      // Antes de intentar parsearla como número
      let textoFinal = this.reemplazarMarcadores(dato, dataPDF, fila);

      // Ahora extraer el valor numérico de la cadena resultante
      // Usamos una expresión regular para encontrar números (incluyendo decimales y signos)
      // Esta regex busca: opcionalmente un signo '-', seguido de dígitos, opcionalmente un punto y más dígitos
      const numeroRegex = /(-?\d+\.?\d*)/;
      const match = textoFinal.match(numeroRegex);

      if (match) {
        // Tomar el primer número encontrado en la cadena
        dato = parseFloat(match[1]); // Usar parseFloat para manejar decimales
      } else {
        // Si no se encuentra un número en la cadena, usar 0 como fallback
        console.warn("No se pudo extraer un valor numérico de:", textoFinal, "Usando 0.");
        dato = 0;
      }
    }

    // 2. paso el string a número
    let valor = Number(dato);

    // 3. Preparar color
    const fontColor = (valor < 0 && colorNegativo)
      ? colorNegativo
      : color;

    // 4. Formateo
    let textoValor = this.formatearNumero(
      valor,
      elemento.decimales,
      elemento.cerosIzquierda || 0,
      elemento.miles !== undefined ? elemento.miles : true
    );

    if (elemento.simbolo) {
      if (elemento.atras) {
        textoValor = textoValor + ' ' + elemento.simbolo;
      } else {
        textoValor = elemento.simbolo + ' ' + textoValor;
      }
    }

    // 5. Medir texto para alineación
    const font = await page.doc.embedFont(fuente || StandardFonts.Helvetica);
    const fontSize = tamanoFuente;

    const textWidth = font.widthOfTextAtSize(textoValor, tamanoFuente);
    const textHeight = font.heightAtSize(fontSize);

    // 6. Posiciones X e Y
    let yElemento = elemento.y // cambia se esta en tabla o en general
    let xElemento = 0;

    // si es ticket y el elemento esta por debajo del ticketPieReferencia
    if (this.esTicket && this.ticketPieReferencia < elemento.y) {
      const diferencia = elemento.y - this.ticketPieReferencia;
      yElemento = this.ticketPie + diferencia;
    }

    // 7. Alineacion X e Y en tabla
    if (tabla) {
      const baseTexto = (tabla.alturaFila - pt2mm(textHeight)) / 2
      yElemento = tabla.y + tabla.alturaFila + (tabla.alturaFila * renglon) - baseTexto

      if (xPosicion) {
        xElemento = mm2pt(xPosicion) - textWidth;
        // Asegurar que no sea negativo
        xElemento = Math.max(0, xElemento);
      } else {
        // Usar la posición X del elemento
        xElemento = mm2pt(elemento.x);
      }

    } else {

      xElemento = mm2pt(elemento.margenDerecho) - textWidth;

      // Asegurar que no sea negativo
      xElemento = Math.max(0, xElemento);
      //yElemento = height - mm2pt(yElemento);
    }

    const x = xElemento
    const y = height - mm2pt(yElemento)

    page.drawText(String(textoValor), {
      x: x,
      y: y,
      size: tamanoFuente,
      font: await page.doc.embedFont(fuente || StandardFonts.Helvetica),
      color: this.toPdfColor(fontColor),
    });

  }

  async renderizarFecha(
    page: PDFPage,
    elemento: any,
    tabla?: TroncoTabla,
    fila: number = 0,
    renglon: number = 0,
    dataPDF?: any
  ): Promise<void> {

    const height = page.getHeight();
    let { dato, fuente, tamanoFuente, color } = elemento;

    // 1. Validar y obtener valor de fecha
    let fechaValor: Date | null = null;

    if (!dataPDF) {
      // Modo diseño: si hay marcador, mostrar placeholder o fecha actual
      if (this._tieneMarcador(dato)) {
        fechaValor = new Date(); // Preview con fecha actual
      } else {
        fechaValor = new Date(dato);
      }
    } else {
      // Modo generación: reemplazar marcadores primero
      const textoReemplazado = this.reemplazarMarcadores(dato, dataPDF, fila);

      // Intentar parsear a Date
      fechaValor = this._parsearFecha(textoReemplazado);
    }

    // Si no hay fecha válida, no renderizar (o mostrar placeholder si se desea)
    if (!fechaValor || isNaN(fechaValor.getTime())) {
      // if (elemento.mostrarPlaceholder !== false) {
      //   fechaValor = new Date(); // Fallback a fecha actual
      // } else {
      return;
      //     }
    }

    // 2. Formatear fecha según configuración
    const textoFecha = this.formatearFecha(
      fechaValor,
      elemento.formato || 'DD/MM/YYYY',
      elemento.locale || 'es-AR'
    );

    // 3. Medir texto para alineación
    const font = await page.doc.embedFont(fuente || StandardFonts.Helvetica);
    const textWidth = font.widthOfTextAtSize(textoFecha, tamanoFuente);
    const textHeight = font.heightAtSize(tamanoFuente);

    // 4. Calcular posiciones X e Y
    let yElemento = elemento.y;
    let xElemento = 0;

    // si es ticket y el elemento esta por debajo del ticketPieReferencia
    if (this.esTicket && this.ticketPieReferencia < elemento.y) {
      const diferencia = elemento.y - this.ticketPieReferencia;
      yElemento = this.ticketPie + diferencia;
    }

    if (tabla) {
      const baseTexto = (tabla.alturaFila - pt2mm(textHeight)) / 2;
      yElemento = tabla.y + tabla.alturaFila + (tabla.alturaFila * renglon) - baseTexto;

      if (elemento.alinearDerecha) {
        xElemento = mm2pt(elemento.xPosicion || tabla.x + tabla.ancho) - textWidth;
        xElemento = Math.max(0, xElemento);
      } else {
        xElemento = mm2pt(elemento.x);
      }
    } else {
      if (elemento.alinearDerecha) {
        xElemento = mm2pt(elemento.margenDerecho) - textWidth;
        xElemento = Math.max(0, xElemento);
      } else {
        xElemento = mm2pt(elemento.x);
      }
    }

    const x = xElemento;
    const y = height - mm2pt(yElemento);

    // 5. Dibujar texto
    page.drawText(textoFecha, {
      x: x,
      y: y,
      size: tamanoFuente,
      font: font,
      color: this.toPdfColor(color),
    });
  }

  async renderizarLinea(page: PDFPage, elemento: any): Promise<void> {

    const width = page.getWidth();
    const height = page.getHeight();
    const { grosor, color } = elemento;

    let yElemento = elemento.y;
    let y2Elemento = elemento.y2;

    // si es ticket y el elemento esta por debajo del ticketPieReferencia
    // yElemento
    if (this.esTicket && this.ticketPieReferencia < elemento.y) {
      const diferencia = elemento.y - this.ticketPieReferencia;
      yElemento = this.ticketPie + diferencia;
    }

    // y2Elemento
    if (this.esTicket && this.ticketPieReferencia < elemento.y2) {
      const diferencia = elemento.y2 - this.ticketPieReferencia;
      y2Elemento = this.ticketPie + diferencia;
    }

    const x1 = mm2pt(elemento.x);
    const y1 = height - mm2pt(yElemento);
    const x2 = mm2pt(elemento.x2);
    const y2 = height - mm2pt(y2Elemento);

    page.drawLine({
      start: { x: x1, y: y1 },
      end: { x: x2, y: y2 },
      color: this.toPdfColor(color),
      thickness: grosor
    });
  }

  async renderizarRectangulo(page: PDFPage, elemento: any): Promise<void> {

    //    const width = page.getWidth();
    const height = page.getHeight();
    //    const { color } = elemento;

    // si es ticket y el elemento esta por debajo del ticketPieReferencia
    let yElemento = elemento.y;
    if (this.esTicket && this.ticketPieReferencia < elemento.y) {
      const diferencia = elemento.y - this.ticketPieReferencia;
      yElemento = this.ticketPie + diferencia;
    }


    const x = mm2pt(elemento.x);
    const y = height - mm2pt(yElemento);
    const ancho = mm2pt(elemento.ancho || 210);
    const alto = mm2pt(elemento.alto || yElemento);

    page.drawRectangle({
      x: x,
      y: y,
      width: ancho,
      height: alto,
      borderWidth: elemento.bordeGrosor || 0,
      borderColor: this.toPdfColor(elemento.bordeColor),
      color: this.toPdfColor(elemento.colorRelleno) || undefined,
      opacity: elemento.opacidadRelleno || 0.5,
      borderOpacity: elemento.opacidadBorde || 1,
    });
  }

  async renderizarImagen(page: PDFPage, elemento: any, pdfDoc: PDFDocument, tabla?: TroncoTabla, fila: number = 0, dataPDF?: any): Promise<void> {

    // 1. Validar dato
    let rutaImagen = elemento.ruta
    if (!dataPDF) { // Llamado desde diseño
      if (this._tieneMarcador(rutaImagen)) {
        rutaImagen = 'images/coming-soon/coming-soon.png' // forzar imagen vacia
      }
    } else {
      rutaImagen = this.reemplazarMarcadores(rutaImagen, dataPDF, fila);
    }

    if (rutaImagen == '') { return }

    let imagenBytes: Uint8Array;
    // 2. Cargar imagen
    if (this._isFirebaseStorageUrl(rutaImagen)) {
      // Si es una URL de Firebase Storage, obtener la imagen procesada
      imagenBytes = await this._pdfImageService.getImageForPDF(rutaImagen);

    } else if (rutaImagen == 'comprobante.qr') {

      imagenBytes = dataPDF.qr;


    } else {
      // Si no es una URL de Firebase Storage, cargar la imagen local
      imagenBytes = await this.loadImageAsBytes(rutaImagen);

    }

    // 3. Incrustar imagen en el documento (detecta formato automáticamente)
    const embeddedImage = await this.embedImageFromBytes(pdfDoc, imagenBytes);

    // 4. Obtener tamaño de la página para coordenadas
    const height = page.getHeight();
    const width = page.getWidth();

    const x = mm2pt(elemento.x);

    let yElemento = elemento.y;
    // en el caso de un ticket
    if (this.esTicket && this.ticketPieReferencia < elemento.y) {
      const diferencia = elemento.y - this.ticketPieReferencia;
      yElemento = this.ticketPie + diferencia;
    }

    const y = height - mm2pt(yElemento);

    if (embeddedImage == null || embeddedImage == undefined) { return }

    // 5. Dibujar la imagen
    page.drawImage(embeddedImage, {
      x: x,
      y: y,
      width: elemento.ancho,
      height: elemento.alto,
    });

  }

  // ———————————————————————————————————————————————————————
  // 🎨 Helper:
  // ———————————————————————————————————————————————————————

  /**
   * Convierte cualquier entrada común de color a un objeto Color válido para pdf-lib.
   * Soporta:
   *   - null / undefined → negro
   *   - {r,g,b} ya normalizado o en 0–255
   *   - string: #RGB, #RRGGBB, #RRGGBBAA, rgb(...), rgba(...), hsl(...), nombres CSS básicos
   *   - [r,g,b] o [r,g,b,a] (0–255 o 0–1)
   */
  public toPdfColor(color: any): Color {
    // 1. Fallback a negro si no hay color
    if (color == null) {
      return rgb(0, 0, 0);
    }

    // 2. Si ya es un objeto Color válido (con r,g,b normalizados)
    if (typeof color === 'object' && 'r' in color && 'g' in color && 'b' in color) {
      const { r, g, b } = color;
      return rgb(
        Math.min(1, Math.max(0, Number(r) || 0)),
        Math.min(1, Math.max(0, Number(g) || 0)),
        Math.min(1, Math.max(0, Number(b) || 0))
      );
    }

    let r = 0, g = 0, b = 0;

    // 3. Procesar según tipo
    if (typeof color === 'string') {
      const str = color.trim();

      // Caso: hex (#RGB, #RRGGBB, #RRGGBBAA)
      const hexMatch = /^#([0-9a-f]{3}|[0-9a-f]{6}|[0-9a-f]{8})$/i.exec(str);
      if (hexMatch) {
        let hex = hexMatch[1];
        if (hex.length === 3) {
          hex = hex.split('').map(c => c + c).join(''); // → 6 chars
        }
        // Tomar solo los primeros 6 caracteres (RGB), ignorar AA
        const rgbHex = hex.length === 8 ? hex.slice(0, 6) : hex;
        if (/^[0-9a-f]{6}$/i.test(rgbHex)) {
          r = parseInt(rgbHex.slice(0, 2), 16) / 255;
          g = parseInt(rgbHex.slice(2, 4), 16) / 255;
          b = parseInt(rgbHex.slice(4, 6), 16) / 255;
        } else {
          console.warn(`Parte RGB inválida en hex: "${str}" → usando negro`);
        }
      }
      // Caso: rgb(...) o rgba(...)
      else if (/^rgba?\s*\(/i.test(str)) {
        const match = /^rgba?\s*\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*(?:,\s*[\d.]+\s*)?\)$/i.exec(str);
        if (match) {
          r = Math.min(255, Math.max(0, parseInt(match[1], 10))) / 255;
          g = Math.min(255, Math.max(0, parseInt(match[2], 10))) / 255;
          b = Math.min(255, Math.max(0, parseInt(match[3], 10))) / 255;
        } else {
          console.warn(`Formato rgb(a) no válido: "${str}" → usando negro`);
        }
      }
      // Caso: nombre de color (básico)
      else {
        const lower = str.toLowerCase();
        const named = NAMED_COLORS[lower];
        if (named) {
          [r, g, b] = named.map(v => v / 255);
        } else {
          console.warn(`Color desconocido: "${str}" → usando negro`);
        }
        // Nota: hsl() se omite porque pdf-lib no lo usa directamente y requiere conversión
        // Si lo necesitas, puedo añadir una función de conversión hsl→rgb.
      }
    }
    // 4. Caso: array [r, g, b] o [r, g, b, a]
    else if (Array.isArray(color)) {
      const [r0, g0, b0] = color.map(v => Number(v));
      if (!isNaN(r0) && !isNaN(g0) && !isNaN(b0)) {
        if (r0 > 1 || g0 > 1 || b0 > 1) {
          // Asumir 0–255
          r = Math.min(255, Math.max(0, r0)) / 255;
          g = Math.min(255, Math.max(0, g0)) / 255;
          b = Math.min(255, Math.max(0, b0)) / 255;
        } else {
          // Asumir 0–1
          r = Math.min(1, Math.max(0, r0));
          g = Math.min(1, Math.max(0, g0));
          b = Math.min(1, Math.max(0, b0));
        }
      } else {
        console.warn('Array de color con valores no numéricos → usando negro:', color);
      }
    } else {
      console.warn('Tipo de color no soportado → usando negro:', typeof color, color);
    }

    // 5. Garantizar rango [0,1] y devolver
    return rgb(
      Math.min(1, Math.max(0, r)),
      Math.min(1, Math.max(0, g)),
      Math.min(1, Math.max(0, b))
    );
  }

  // Función auxiliar para cargar imagen como Uint8Array (ej. desde URL)
  async loadImageAsBytes(url: string): Promise<Uint8Array> {
    // 🔹 Caso 1: Data URL (Base64) - ej: "data:image/png;base64,iVBORw0KG..."
    if (url.startsWith('data:image')) {
      const base64Data = url.split(',')[1];
      if (!base64Data) {
        throw new Error('Data URL inválida: no se encontraron datos base64');
      }
      // Decodificar base64 a Uint8Array
      const binaryString = atob(base64Data);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      return bytes;
    }

    // 🔹 Caso 2: Blob URL - ej: "blob:https://..."
    if (url.startsWith('blob:')) {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Failed to fetch blob URL: ${response.statusText}`);
      }
      const arrayBuffer = await response.arrayBuffer();
      return new Uint8Array(arrayBuffer);
    }

    // 🔹 Caso 3: URL HTTP/HTTPS normal
    try {
      const response = await fetch(url, {
        mode: 'cors', // ← Importante para recursos externos
        credentials: 'omit'
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const arrayBuffer = await response.arrayBuffer();
      return new Uint8Array(arrayBuffer);

    } catch (error) {
      // 🔹 Fallback: Intentar cargar como imagen local (para desarrollo)
      if (url.startsWith('/assets/') || url.startsWith('assets/')) {
        // En Angular, los assets se sirven desde la raíz
        const normalizedUrl = url.startsWith('assets/') ? `/${url}` : url;
        const response = await fetch(normalizedUrl);
        if (!response.ok) {
          throw new Error(`No se pudo cargar la imagen local: ${url}`);
        }
        return new Uint8Array(await response.arrayBuffer());
      }

      // Re-lanzar el error original si no hay fallback
      throw error;
    }
  }

  async embedImageFromBytes(pdfDoc: PDFDocument, imageBytes: Uint8Array) {
    // Detección automática por *signature* (bytes iniciales)
    if (imageBytes[0] === 0xFF && imageBytes[1] === 0xD8 && imageBytes[2] === 0xFF) {
      // JPEG signature: 0xFF 0xD8 0xFF ...
      return await pdfDoc.embedJpg(imageBytes);
    } else if (
      imageBytes[0] === 0x89 &&
      imageBytes[1] === 0x50 &&
      imageBytes[2] === 0x4E &&
      imageBytes[3] === 0x47
    ) {
      // PNG signature: 0x89 0x50 0x4E 0x47 ...
      return await pdfDoc.embedPng(imageBytes);
    } else {
      throw new Error('Formato de imagen no soportado. Solo PNG y JPG.');
    }
  }

  formatearNumero(
    valor: number | null | undefined,
    decimales: number = 2,
    cerosIzquierda: number = 0,
    miles: boolean = true
  ): string {

    // Manejar null/undefined/NaN
    if (valor == null || isNaN(valor)) {
      const entero = cerosIzquierda ? '0'.repeat(cerosIzquierda) : '0';
      const parteDecimal = decimales > 0 ? '0'.repeat(decimales) : '';
      return decimales > 0 ? `${entero},${parteDecimal}` : entero;
    }

    //
    const factor = Math.pow(10, decimales);
    const redondeado = Math.round(valor * factor) / factor;
    const esNegativo = redondeado < 0;
    const absValor = Math.abs(redondeado);

    // Separar entero y decimal
    const enteroNum = Math.floor(absValor);
    const enteroStr = enteroNum.toString();

    // Aplicar padding a la parte entera
    const enteroConCeros = cerosIzquierda
      ? enteroStr.padStart(cerosIzquierda, '0')
      : enteroStr;

    // Formatear miles SOLO en la parte entera
    let enteroConPuntos = ''
    if (miles) {
      enteroConPuntos = enteroConCeros.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    } else {
      enteroConPuntos = enteroConCeros;
    }

    // Parte decimal
    let parteDecimal = '';
    if (decimales > 0) {
      const decPart = (absValor - enteroNum).toFixed(decimales).split('.')[1] || '';
      parteDecimal = decPart.padEnd(decimales, '0').slice(0, decimales);
    }

    // Ensamblar
    let resultado = enteroConPuntos;
    if (decimales > 0) {
      resultado += ',' + parteDecimal;
    }

    return esNegativo ? '-' + resultado : resultado;
  }

  /**
   * Obtiene el valor de una variable anidada a partir de una ruta de propiedad en formato de puntos.
   * @param obj El objeto en el que buscar.
   * @param path La ruta de la propiedad (por ejemplo, 'cliente.nombre').
   * @returns El valor encontrado o undefined si no se encuentra.
   */
  getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((current, key) => {
      return current && current[key] !== undefined ? current[key] : undefined;
    }, obj);
  }

  /**
   * Reemplaza marcadores en una cadena de texto con valores de un objeto de datos.
   * Soporta marcadores simples ({{titulo}}), anidados ({{cliente.nombre}})
   * y de arrays con índice explícito ({{productos[0].nombre}}, {{items[1].precio}}).
   *
   * Reglas de resolución de arrays:
   * - Si el marcador tiene índice explícito: {{productos[0].nombre}} → usa ese índice
   * - Si el marcador NO tiene índice y la propiedad es un array:
   *   usa el parámetro arrayIndex (por defecto la fila actual en tablas)
   *
   * Si un marcador no tiene valor, se omite completamente (cadena vacía).
   */
  reemplazarMarcadores(
    template: string,
    dataPDF: any,
    arrayIndex: number = 0): string {

    if (!template || typeof template !== 'string') return template;

    const markerRegex = /{{\s*([^{}]+)\s*}}/g;

    return template.replace(markerRegex, (match, marker) => {
      const trimmedMarker = marker.trim();
      const valor = this.resolvePathWithArrays(trimmedMarker, dataPDF, arrayIndex);

      // Si el valor es null, undefined, o cualquier otro valor "falsy" que consideres vacío,
      // devolvemos una cadena vacía en lugar del marcador original
      if (valor == null || valor === '') {
        return ''; // No mostrar nada si no hay información
      }

      // Para el caso de números, podrías aplicar formateo específico aquí
      // Si el marcador es de tipo número, aplicar formateo
      if (typeof valor === 'number') {
        // Podrías tener lógica específica para formatear números basado en el contexto
        // Por ahora, simplemente convertimos a string
        return String(valor);
      }

      return String(valor); // Convertir el valor a string para insertarlo
    });
  }

  /**
   * Resuelve un path tipo "comprobante.items.nombre", "cliente.direcciones[0].ciudad", "items[1].descripcion"
   * manejando arrays con índices implícitos (pasados como parámetro arrayIndex) y explícitos (dentro del path).
   * Prioriza el índice explícito si está presente.
   */
  private resolvePathWithArrays(path: string, data: any, arrayIndex: number = 0): any {
    if (!data || !path) return undefined;

    // Esta regex separa el path en partes manejando índices explícitos
    const parts = path.split('.').flatMap(part => {
      const match = part.match(/^([^\[\]]+)\[(\d+)\]$/);
      if (match) {
        // Retorna ['nombreArray', 'indice'] para índices explícitos
        return [match[1], match[2]];
      } else {
        // Retorna ['nombrePropiedad'] para propiedades normales o arrays con índice implícito
        return [part];
      }
    });

    let current: any = data;
    let i = 0;

    while (i < parts.length) {
      const part = parts[i];

      if (current === null || current === undefined) {
        return undefined;
      }

      // Verificar si la parte actual es un número (índice explícito)
      const explicitIndex = parseInt(part, 10);
      if (!isNaN(explicitIndex)) {
        // Este paso ocurre después de leer el nombre del array (p.ej., 'items')
        // current debe ser un array para poder usar explicitIndex
        if (Array.isArray(current)) {
          if (explicitIndex >= 0 && explicitIndex < current.length) {
            current = current[explicitIndex];
            i++; // Avanzar al siguiente segmento del path (el que sigue al índice)
          } else {
            return undefined; // Índice explícito fuera de rango
          }
        } else {
          return undefined; // Se esperaba un array para el índice explícito
        }
      } else {
        // Acceder normalmente a la propiedad (no es un índice explícito)
        current = current[part];

        // --- Lógica para índice implícito ---
        // Si la propiedad accesada es un array Y el próximo segmento NO es un índice explícito,
        // entonces usamos el arrayIndex implícito proporcionado.
        if (Array.isArray(current) && i + 1 < parts.length) {
          const nextPart = parts[i + 1];
          const nextExplicitIndex = parseInt(nextPart, 10);
          // Solo aplica índice implícito si el siguiente paso NO es un índice explícito
          if (isNaN(nextExplicitIndex)) {
            if (arrayIndex >= 0 && arrayIndex < current.length) {
              current = current[arrayIndex];
            } else {
              return undefined; // Índice implícito fuera de rango
            }
          }
          // Si el siguiente paso SÍ es un índice explícito, no se aplica el implícito aquí,
          // la lógica del índice explícito lo manejará en la siguiente iteración del while.
        }
        // --- Fin lógica índice implícito ---

        i++; // Avanzar al siguiente segmento del path
      }
    }

    return current;
  }

  private _tieneMarcador(texto: string): boolean {
    if (typeof texto !== 'string') return false;
    return /\{\{[^}]*\}\}/.test(texto);
  }

  private _isFirebaseStorageUrl(input: string): boolean {
    // Verifica si es una URL completa de Firebase Storage
    return input.startsWith('https://') &&
      input.includes('firebasestorage.googleapis.com');
  }

  private _generarCaracteres(
    longitud: number,
    caracter: string = "x"
  ): string {
    if (longitud < 0) {
      throw new Error("La longitud debe ser un número positivo");
    }
    if (caracter.length !== 1) {
      throw new Error("El carácter debe ser de 1 solo caracter");
    }
    return caracter.repeat(longitud);
  }

  // ———————————————————————————————————————————————————————
  // 🎨 Helper: De fecha
  // ———————————————————————————————————————————————————————
  private _parsearFecha(input: any): Date | null {
    if (!input) return null;

    // Si ya es Date, retornar
    if (input instanceof Date) {
      return isNaN(input.getTime()) ? null : input;
    }

    // Si es string, intentar parsear
    if (typeof input === 'string') {
      // Formato ISO o timestamp numérico como string
      if (/^\d{4}-\d{2}-\d{2}/.test(input) || /^\d+$/.test(input)) {
        const date = new Date(input);
        return isNaN(date.getTime()) ? null : date;
      }
      // Formato DD/MM/YYYY
      if (/^\d{2}\/\d{2}\/\d{4}/.test(input)) {
        const [d, m, y] = input.split('/').map(Number);
        const date = new Date(y, m - 1, d);
        return isNaN(date.getTime()) ? null : date;
      }
    }

    // Fallback: intentar con constructor Date genérico
    const date = new Date(input);
    return isNaN(date.getTime()) ? null : date;
  }

  /**
 * Formatea una fecha según el formato especificado.
 * Formatos soportados: 'DD/MM/YYYY', 'MM/DD/YYYY', 'YYYY-MM-DD',
 * 'DD/MM/YY', 'LARGO' (ej: "29 de marzo de 2026"), 'HORA' (HH:mm), etc.
 */
  formatearFecha(
    fecha: Date,
    formato: string = 'DD/MM/YYYY',
    locale: string = 'es-AR'
  ): string {

    if (!fecha || isNaN(fecha.getTime())) {
      return '';
    }

    // Caso especial: formato largo con nombre de mes en español
    if (formato === 'LARGO') {
      const meses = [
        'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
        'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
      ];
      const dia = fecha.getDate();
      const mes = meses[fecha.getMonth()];
      const anio = fecha.getFullYear();
      return `${dia} de ${mes} de ${anio}`;
    }

    // Caso especial: solo hora
    if (formato === 'HORA' || formato === 'HH:mm') {
      return fecha.toLocaleTimeString(locale, {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      });
    }

    // Extraer componentes
    const d = String(fecha.getDate()).padStart(2, '0');
    const m = String(fecha.getMonth() + 1).padStart(2, '0');
    const y = fecha.getFullYear();
    const yy = String(y).slice(-2);
    const h = String(fecha.getHours()).padStart(2, '0');
    const min = String(fecha.getMinutes()).padStart(2, '0');

    // Reemplazos según formato
    let resultado = formato
      .replace('DD', d)
      .replace('MM', m)
      .replace('YYYY', String(y))
      .replace('YY', yy)
      .replace('HH', h)
      .replace('mm', min);

    return resultado;
  }

}