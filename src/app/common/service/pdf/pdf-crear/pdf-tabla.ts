import { inject, Injectable } from '@angular/core';
import {
    PDFPage,
    rgb,
    StandardFonts,
    Color,
    PDFFont,
    TextAlignment,
    PDFDocument
} from 'pdf-lib';
import { mm2pt, pt2mm, NAMED_COLORS } from './utils/page-size';
import { EstructuraJSON, RamaColumna, TroncoGeneral, TroncoTabla } from './models/json-estructura.model';
import { ElementosPDFService } from './pdf-elementos';
import { CustomizerSettingsService } from '@base/src/app/perfil/customizer-settings/customizer-settings.service';
import { DomSanitizer } from '@angular/platform-browser';
import { PdfGeneratorService } from './pdf-editor.service';
import { BehaviorSubject } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class TablaPDFService {

    #elementos = inject(ElementosPDFService);
    columnas: RamaColumna[] = [];

    // largo Tabla
    private _largoTabla = new BehaviorSubject<number>(0);
    public largoTabla$ = this._largoTabla.asObservable();

    // largo Ticket
    private _largoTicket = new BehaviorSubject<number>(0);
    public largoTicket$ = this._largoTicket.asObservable();

    constructor(

        public themeService: CustomizerSettingsService,
        private sanitizer: DomSanitizer,

    ) { }

    // **********************************************************************
    // SET GET datos
    // **********************************************************************

    setLargoTabla(_largoTabla: number): void {
        this._largoTabla.next(_largoTabla);
    }

    get largoTabla(): number {
        return this._largoTabla.getValue();
    }

    setLargoTicket(_largoTicket: number): void {
        this._largoTicket.next(_largoTicket);
    }

    get largoTicket(): number {
        return this._largoTicket.getValue();
    }

    async armadoTabla(estructura: EstructuraJSON, page: PDFPage, pdfDoc: PDFDocument, dataPDF?: any): Promise<void> {

        // Si no hay tabla retorna
        if (this.isEmptyObject(estructura.tabla)) { return }

        const tabla = estructura.tabla;
        const columnas = tabla.columnas;

        console.log("dibujaTabla")
        await this._dibujaTabla(tabla, page)

        console.log("armaTabla")
        await this._armaTabla(estructura)

        console.log("dibujaColumnas")
        await this._dibujaColumnas(estructura, page)

        console.log('dibujaCeldas')
        await this._dibujaCeldas(estructura, page, pdfDoc, dataPDF) // Aquí se dibujan los elementos de las columnas


    }

    private async _dibujaTabla(tabla: TroncoTabla, page: PDFPage): Promise<void> {

        let largoTabla = 0;

        if (this._largoTabla.getValue() > 0) {
            largoTabla = this._largoTabla.getValue();
        } else {
            largoTabla = tabla.alto;
        }

        // 1. Dibuja Encabezado
        await this.#elementos.renderizarRectangulo(page, {
            x: tabla.x,
            y: tabla.y,
            ancho: tabla.ancho,
            alto: tabla.alturaCabecera,
            colorRelleno: tabla.headerColor,
            opacity: 0.5
        })

        // 2. Dibuja borde derecho
        await this.#elementos.renderizarLinea(page, {
            x: tabla.x,
            y: tabla.y,
            x2: tabla.x,
            y2: tabla.y + largoTabla - tabla.alturaCabecera,
            grosor: 0.5,
            color: tabla.headerColor,
        })

        // 3. Dibuja borde izquierdo
        await this.#elementos.renderizarLinea(page, {
            x: tabla.x + tabla.ancho,
            y: tabla.y,
            x2: tabla.x + tabla.ancho,
            y2: tabla.y + largoTabla - tabla.alturaCabecera,
            grosor: 0.5,
            color: tabla.headerColor,
        })

        // 4. Dibuja borde Inferior
        console.log("bonde Interior", {
            x: tabla.x,
            y: tabla.y + largoTabla - tabla.alturaCabecera,
            x2: tabla.x + tabla.ancho,
            y2: tabla.y + largoTabla - tabla.alturaCabecera,
            grosor: 5,
            color: tabla.headerColor,
            opacity: 0.5
        })

        await this.#elementos.renderizarLinea(page, {
            x: tabla.x,
            y: tabla.y + largoTabla - tabla.alturaCabecera,
            x2: tabla.x + tabla.ancho,
            y2: tabla.y + largoTabla - tabla.alturaCabecera,
            grosor: 5,
            color: tabla.headerColor,
            opacity: 0.5
        })
    }

    private async _ordenarColumnas(columnas: RamaColumna[]): Promise<RamaColumna[]> {
        return [...columnas].sort((a, b) => a.orden - b.orden);
    }


    private async _armaTabla(estructura: EstructuraJSON): Promise<void> {

        const tabla = estructura.tabla;
        const columnas = tabla.columnas;

        // 1. Se ordena
        this.columnas = await this._ordenarColumnas(columnas);

        // 2. Coordenadas
        let xActual = tabla.x;
        for (const col of this.columnas) {
            col.xInicio = xActual;
            xActual += col.ancho;
            col.xFin = xActual;
        }

    }

    private async _dibujaColumnas(estructura: EstructuraJSON, page: PDFPage): Promise<void> {

        const tabla = estructura.tabla;
        const columnas = tabla.columnas;

        // calcula items por pagina
        this.#elementos.itemsPorPagina = Math.floor(tabla.alto / tabla.alturaFila)

        for (const col of columnas) {

            // 1. Medir texto para alineación centrada
            const font = await page.doc.embedFont(col.fuente || StandardFonts.Helvetica);
            const textWidth = pt2mm(font.widthOfTextAtSize(col.titulo, col.tamanoFuente || 10));
            const textHeight = pt2mm(font.heightAtSize(col.tamanoFuente || 10));

            const availableWidth = col.xFin - col.xInicio;
            const centeredX = col.xInicio + (availableWidth - textWidth) / 2;
            const centeredY = tabla.y - (tabla.alturaCabecera - textHeight) / 2;

            // 2. Escribir Titulo
            this.#elementos.renderizarTexto(page, {
                dato: col.titulo,
                fuente: col.fuente,
                tamanoFuente: col.tamanoFuente,
                color: col.color,
                x: centeredX,
                y: centeredY
            })

            // 3. linea separacion
            await this.#elementos.renderizarLinea(page, {
                x: col.xFin,
                y: tabla.y,
                x2: col.xFin,
                y2: tabla.y + tabla.alto - tabla.alturaCabecera,
                grosor: 0.5,
                color: tabla.headerColor,
            })
        }


    }

    private async _dibujaCeldas(estructura: EstructuraJSON, page: PDFPage, pdfDoc: PDFDocument, dataPDF?: any): Promise<void> {
        const tabla = estructura.tabla;
        const columnas = tabla.columnas;
        let fila = 0;
        let filas = 0
        let renglon = 0;

        // Determinar el número de filas a dibujar
        let inicio = 0
        let fin = 0
        if (dataPDF) {          // en produccion
            inicio = this.#elementos.itemActual;
            fin = Math.min(inicio + this.#elementos.itemsPorPagina, this.#elementos.totalItems);

        } else {               // en diseño
            inicio = 1;
            fin = this.#elementos.itemsPorPagina;
        }

        for (let fila = inicio; fila < fin; fila++) {

            // Actualizar el índice global del ítem
            this.#elementos.itemActual++;
            renglon = fila - inicio

            // Iterar sobre cada columna definida
            for (const columna of columnas) {

                // Llamar al servicio de elementos para dibujar los elementos específicos de esta columna
                // Pasamos 'columna' en lugar de 'estructura.general', porque 'columna' tiene su propia propiedad 'elementos'
                await this.#elementos.armadoElementos(columna, page, pdfDoc, dataPDF, { tabla, xPosicion: columna.xFin, fila, renglon });
            }

        }

    }

    private isEmptyObject(obj: any): boolean {
        return obj != null &&
            typeof obj === 'object' &&
            !Array.isArray(obj) &&
            Object.keys(obj).length === 0;
    }
}