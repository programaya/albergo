import { Injectable, Inject, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { PDFDocument, PDFPage, rgb, StandardFonts } from 'pdf-lib';
import {
  getPageSize,
  PageSizeName,
  mm2pt,
  pt2mm
} from './utils/page-size';
import { EstructuraJSON } from './models/json-estructura.model';
import { DepuracionPDFService } from './pdf-depuracion';
import { ElementosPDFService } from './pdf-elementos';
import { TablaPDFService } from './pdf-tabla';
import { JsonFileService } from './json-file/json-file.service';
import { firstValueFrom, Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { forEach } from 'lodash';

@Injectable({
  providedIn: 'root',
})
export class PdfGeneratorService {
  pdfDoc!: PDFDocument;
  page!: PDFPage;

  modoDepuracion = false; // ← Actívalo desde tu componente si quieres reglas

  #regla = inject(DepuracionPDFService);
  #elementos = inject(ElementosPDFService);
  #tabla = inject(TablaPDFService);
  #jsonFileService = inject(JsonFileService); // Inyectar el servicio

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private _http: HttpClient
  ) {
    // Garantizar que solo se use en navegador
    if (!isPlatformBrowser(this.platformId)) {
      throw new Error('PdfGeneratorService solo debe usarse en el navegador (cliente).');
    }
  }

  // Método para cargar JSON desde una URL
  private async _loadJsonFromUrl(url: string): Promise<any> {
    try {
      // Usamos firstValueFrom para convertir el Observable de HttpClient en una Promise
      const data = await firstValueFrom(this._http.get(url));
      return data;
    } catch (error) {
      console.error('Error al cargar el archivo JSON desde la URL:', url, error);
      throw error; // Lanza el error para que pueda ser manejado por el llamador
    }
  }

  async imprimirPDF(urlPlantilla: string, dataParaPDF: any): Promise<Blob> {


    try {
      //? 1. Carga el JSON de la plantilla desde la URL (por ejemplo, 'pdf/precios.json')
      const estructuraJson = await this._loadJsonFromUrl(urlPlantilla);

      // Configurar paginación
      this.#elementos.totalItems = dataParaPDF.comprobante.items.length;
      this.#elementos.itemsPorPagina = estructuraJson.tabla?.maxRowsPerPage || 10;
      this.#elementos.totalPaginas = Math.max(1, Math.ceil(this.#elementos.totalItems / this.#elementos.itemsPorPagina));

      console.log('Paginación configurada:', {
        totalItems: this.#elementos.totalItems,
        itemsPorPagina: this.#elementos.itemsPorPagina,
        totalPaginas: this.#elementos.totalPaginas
      });

      this.#elementos.esTicket = (estructuraJson.general.tipoDocumento === 'ticket'); // Configura el tipo de documento en ElementosPDFService


      //? 2. Genera el PDF usando la estructura y los datos proporcionados
      const pdfBytes = await this.generar(estructuraJson, false, dataParaPDF);
      const pdfBlob = new Blob([pdfBytes], { type: 'application/pdf' });

      return pdfBlob;

    } catch (error) {
      console.error('Error en imprimirPDF:', error);
      // Maneja el error adecuadamente (mostrar mensaje al usuario, etc.)
      throw error; // Re-lanzar el error para que el componente pueda manejarlo
    }
  }

  async generar(estructura: EstructuraJSON, debug = true, dataPDF?: any): Promise<Uint8Array> {

    this.modoDepuracion = debug;

    // Validar estructura básica
    if (!estructura || !estructura.general) {
      throw new Error('Estructura JSON inválida o incompleta.');
    }

    // Establecer datos generales por omisión
    estructura.general.nombre = estructura.general.nombre || 'Reporte';
    estructura.general.tamanoPapel = estructura.general.tamanoPapel || 'A4';
    estructura.general.orientacion = estructura.general.orientacion || 'normal';
    estructura.general.fuente = estructura.general.fuente || 'Courier';
    estructura.general.tamanoFuente = estructura.general.tamanoFuente || 12;
    estructura.general.color = estructura.general.color || '#000000';
    estructura.general.alturaEncabezado = estructura.general.alturaEncabezado || 50;
    estructura.general.alturaPie = estructura.general.alturaPie || 10;

    this.page = await this._crearPagina(estructura, dataPDF);

    // ———————————————————————————————————————————————————————
    // 📐 Modo Depuración: Reglas y Cuadricula
    // ———————————————————————————————————————————————————————

    if (this.modoDepuracion) {
      console.log('🛠️ Modo depuración activado: dibujando reglas y cuadrícula');
      await this.#regla.depuracion(estructura, this.page);
    }

    for (this.#elementos.paginaActual = 1; this.#elementos.paginaActual <= this.#elementos.totalPaginas; this.#elementos.paginaActual++) {

      if (this.#elementos.paginaActual > 1) {
        this.page = await this._agregarPagina(this.pdfDoc, estructura); // sin plantilla

      }

      // Configurar índices para paginación
      if (this.#elementos.esTicket) {
        // En modo ticket, renderizamos TODO en una sola página (no paginamos)
        this.#elementos.itemActual = 0;
      } else {
        this.#elementos.itemActual = (this.#elementos.paginaActual - 1) * this.#elementos.itemsPorPagina;
        const finItem = Math.min(this.#elementos.itemActual + this.#elementos.itemsPorPagina, this.#elementos.totalItems);

      }

      // ———————————————————————————————————————————————————————
      // 🖼️ Renderizado de Elementos Generales
      // ———————————————————————————————————————————————————————
      await this.#elementos.armadoElementos(estructura.general, this.page, this.pdfDoc, dataPDF);

      // ———————————————————————————————————————————————————————
      // 📊 Renderizado de Tabla
      // ———————————————————————————————————————————————————————
      await this.#tabla.armadoTabla(estructura, this.page, this.pdfDoc, dataPDF);
    }
    // ———————————————————————————————————————————————————————
    // 📤 Guardar y devolver PDF final
    // ———————————————————————————————————————————————————————
    return await this.pdfDoc.save();
  }

  // ———————————————————————————————————————————————————————
  // 📄 Crear Pagina con o sin plantilla
  // ———————————————————————————————————————————————————————

  private async _crearPagina(
    estructura: EstructuraJSON,
    dataPDF?: any
  ): Promise<PDFPage> {

    // 🆕 Siempre creamos un PDF nuevo (para control total de tamaño/multipágina)
    this.pdfDoc = await PDFDocument.create();

    // ⚙️ Configurar metadata
    await this._configurarDocumento(estructura);

    // 📄 Crear primera página
    this.page = await this._agregarPagina(this.pdfDoc, estructura, dataPDF); // sin plantilla


    // ⚙️ Configuracion General - CON MAPEO DE FUENTES
    const convertedFont = this.convertirFuente(estructura.general.fuente);
    const generalFont = await this.pdfDoc.embedFont(this.getFontByString(convertedFont));
    const fontColor = estructura.general.color;
    // this.page.setFont(generalFont);
    // this.page.setFontSize(estructura.general.tamanoFuente);
    // this.page.setFontColor(rgb(fontColor[0], fontColor[1], fontColor[2]));

    return this.page;
  }

  // ———————————————————————————————————————————————————————
  // 🔍 Helper: Conversión de fuente
  // ———————————————————————————————————————————————————————
  private convertirFuente(fuente: string): string {
    // Convertir el formato 'StandardFonts.Courier' al formato 'Courier'
    if (fuente && fuente.startsWith('StandardFonts.')) {
      let nombreFuente = fuente.replace('StandardFonts.', '');
      // Ajustar nombres especiales
      if (nombreFuente === 'TimesRomanBold') nombreFuente = 'Times-Bold';
      if (nombreFuente === 'TimesRomanItalic') nombreFuente = 'Times-Italic';
      if (nombreFuente === 'TimesRomanBoldItalic') nombreFuente = 'Times-BoldItalic';
      return nombreFuente;
    }
    return fuente;
  }

  // ———————————————————————————————————————————————————————
  // 🔍 Helper: Obtener fuente por string
  // ———————————————————————————————————————————————————————
  private getFontByString(fontName: string) {
    // Mapeo de strings a StandardFonts
    const fontMap: { [key: string]: any } = {
      'Helvetica': StandardFonts.Helvetica,
      'Helvetica-Bold': StandardFonts.HelveticaBold,
      'Helvetica-Oblique': StandardFonts.HelveticaOblique,
      'Helvetica-BoldOblique': StandardFonts.HelveticaBoldOblique,
      'Times-Roman': StandardFonts.TimesRoman,
      // 'Times-Bold': StandardFonts.TimesBold,
      // 'Times-Italic': StandardFonts.TimesItalic,
      // 'Times-BoldItalic': StandardFonts.TimesBoldItalic,
      'Courier': StandardFonts.Courier,
      'Courier-Bold': StandardFonts.CourierBold,
      'Courier-Oblique': StandardFonts.CourierOblique,
      'Courier-BoldOblique': StandardFonts.CourierBoldOblique,
      'Symbol': StandardFonts.Symbol,
      'ZapfDingbats': StandardFonts.ZapfDingbats,
    };

    // Devolver la fuente correspondiente o Helvetica por defecto
    return fontMap[fontName] || StandardFonts.Helvetica;
  }

  // ———————————————————————————————————————————————————————
  // 📏 Helper: Extraer ancho numérico de tamaños como '80mm', '58mm'
  // ———————————————————————————————————————————————————————
  private _extraerAnchoMm(tamanoPapel: string): number {
    const match = tamanoPapel.match(/(\d+)mm/);
    return match ? parseInt(match[1], 10) : 80; // Default 80mm si no encuentra
  }

  // ———————————————————————————————————————————————————————
  // 📏 Helper: Calcular altura dinámica para tickets
  // ———————————————————————————————————————————————————————
  private _calcularAlturaTicket(estructura: EstructuraJSON, dataPDF?: any): number {
    const general = estructura.general;
    const tabla = estructura.tabla;

    // Altura del encabezado
    const alturaEncabezado = general.alturaEncabezado || 50;

    // Altura de la tabla (cabecera + filas)
    //const alturaCabecera = tabla?.alturaCabecera || 10;
    const alturaFila = tabla?.alturaFila || 10;
    const totalItems = dataPDF?.comprobante?.items?.length || 10;
    const alturaTabla = ((totalItems + 1) * alturaFila);

    this.#tabla.setLargoTabla(alturaTabla);  // comparte altura tabla

    // Altura del pie de página
    const alturaPie = general.alturaPie || 60;

    // Altura total del ticket
    const alturaTicket = alturaEncabezado + alturaTabla + alturaPie;

    this.#elementos.ticketPieReferencia = alturaEncabezado + (10 * alturaFila); // Configura la altura del pie en para 10 Items
    this.#elementos.ticketPie = alturaEncabezado + alturaTabla; // Configura la altura del pie justo después de la tabla

    console.log('📏 Altura calculada para ticket:', {
      alturaEncabezado,
      alturaTabla,
      alturaPie,
      alturaFila,
      totalItems,
      alturaTicket
    });

    return alturaTicket;
  }

  private async _agregarPagina(
    pdfDoc: PDFDocument,
    estructura: EstructuraJSON,
    dataPDF?: any
  ): Promise<PDFPage> {
    const tipoDocumento = estructura.general.tipoDocumento || 'standard';
    const tamanoPapel = estructura.general.tamanoPapel;

    let anchoPuntos: number;
    let altoPuntos: number;
    let largoTabla: number;

    // 🎫 MODO TICKET: Altura dinámica
    if (tipoDocumento === 'ticket') {
      // Extraer el ancho del string '80mm' o '58mm'
      const anchoMm = this._extraerAnchoMm(tamanoPapel);
      anchoPuntos = mm2pt(anchoMm);

      // Calcular altura dinámicamente basada en el contenido
      altoPuntos = mm2pt(this._calcularAlturaTicket(estructura, dataPDF)); // Convertir a mm y luego a puntos

      this.#tabla.setLargoTicket(altoPuntos);

      console.log(`🎫 Creando página de ticket: ${anchoMm}mm x ${altoPuntos.toFixed(2)}mm`);

    } else {
      // 📄 MODO STANDARD: Usar tamaños predefinidos (A4, Letter, etc.)
      const sizePapel = getPageSize(tamanoPapel as PageSizeName, estructura.general.orientacion);

      if (!sizePapel) {
        throw new Error(`Tamaño de papel desconocido: ${tamanoPapel}`);
      }

      anchoPuntos = sizePapel[0];
      altoPuntos = sizePapel[1];

      console.log(`📄 Creando página standard: ${tamanoPapel} (${anchoPuntos}pt x ${altoPuntos}pt)`);
    }

    // Crear la página con las dimensiones calculadas
    const page = pdfDoc.addPage([anchoPuntos, altoPuntos]);

    return page;
  }

  // ———————————————————————————————————————————————————————
  // ⚙️ Configurar metadata (igual que antes)
  // ———————————————————————————————————————————————————————
  private async _configurarDocumento(estructura: EstructuraJSON): Promise<void> {
    // Titulo
    this.pdfDoc.setTitle(estructura.general.nombre);
    this.pdfDoc.setAuthor('DiPS - GESSI');
    this.pdfDoc.setCreator('ProgramaYa');
    this.pdfDoc.setCreationDate(new Date());
  }

  // ———————————————————————————————————————————————————————
  // 🔍 Helper
  // ———————————————————————————————————————————————————————

  // Validar si el campo `archivo` contiene un PDF válido
  private _esPdfValido(data: any): boolean {
    if (!data) return false;

    // Aceptamos: Uint8Array, ArrayBuffer, o Array<number> (JSON-safe)
    if (data instanceof Uint8Array) return true;
    if (data instanceof ArrayBuffer) return true;
    if (Array.isArray(data) && data.length > 0 && typeof data[0] === 'number') {
      // Verificación ligera: PDF empieza con %PDF-
      if (data.length >= 5) {
        const header = String.fromCharCode(...data.slice(0, 5));
        return header === '%PDF-';
      }
    }
    return false;
  }

  // Convertir a ArrayBuffer (pdf-lib lo requiere)
  private _toArrayBuffer(data: any): ArrayBuffer {
    if (data instanceof ArrayBuffer) return data;
    if (data instanceof Uint8Array) return data.buffer;
    if (Array.isArray(data)) return new Uint8Array(data).buffer;
    throw new Error('Formato de archivo no soportado. Se espera Uint8Array, ArrayBuffer o number[].');
  }

  // pdf-generator.service.ts → dentro de la clase PdfGeneratorService
  public async getPreviewBlob(estructura: EstructuraJSON, modoDepuracion: boolean): Promise<Blob> {
    const pdfBytes = await this.generar(estructura, modoDepuracion); // genera el Uint8Array
    return new Blob([pdfBytes], { type: 'application/pdf' });
  }
}

// ———————————————————————————————————————————————————————
// 🖼️ Renderizado (placeholders — reemplázalos con tu lógica real)
// ———————————————————————————————————————————————————————
// ———————————————————————————————————————————————————————
// 🔄 Helper
// ———————————————————————————————————————————————————————
// ———————————————————————————————————————————————————————
// 🎨 Helper:
// ———————————————————————————————————————————————————————

