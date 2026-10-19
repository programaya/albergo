// common/pdf/pdf-crear/models/json-estructura.model.ts
import { StandardFonts } from 'pdf-lib';

// --- INTERFACES Y ESTRUCTURA ---
export interface EstructuraJSON {
  general: TroncoGeneral
  tabla: TroncoTabla
}

export type TipoElemento = 'texto' | 'numero' | 'fecha' | 'linea' | 'rectangulo' | 'imagen';
export type TipoTronco = 'general' | 'tabla';

export interface NodoBase {
  id: string;
  nombre: string; // Solo para UI (se excluye del JSON final)
}

export type NodoArbol = TroncoGeneral | TroncoTabla | RamaElemento | RamaColumna;

// --- TRONCOS ---
export interface TroncoGeneral extends NodoBase { // Extiende de NodoBase
  tipo: TipoTronco; // o específicamente 'general' si es más preciso: tipo: 'general';

  tamanoPapel: 'A4' | 'A5' | 'A6' | 'Letter' | 'Legal';
  tipoDocumento: 'standard' | 'ticket';
  orientacion: 'normal' | 'apaisada';
  archivo?: string;
  fuente: keyof typeof StandardFonts;
  tamanoFuente: number;
  color: string;
  alturaEncabezado: number;
  alturaPie: number;
  elementos?: RamaElemento[];
}

export interface TroncoTabla extends NodoBase { // Extiende de NodoBase
  tipo: TipoTronco; // o específicamente 'tabla' si es más preciso: tipo: 'tabla';

  x: number;
  y: number;
  ancho: number;
  alto: number;
  alturaFila: number;
  alturaCabecera: number;
  headerColor?: string;
  headerTextColor?: string,
  bordeGrosor?: number;
  bordeColor?: string;
  colorRelleno?: string;
  cellPadding?: number;
  maxRowsPerPage?: number;
  columnas: RamaColumna[];
}


// --- ELEMENTOS ---
export interface ElementoBase extends NodoBase { // Extiende de NodoBase
  tipo: TipoElemento;
  orden: number;
  x: number;
  y: number;
}

export interface ElementoTexto extends ElementoBase {
  tipo: 'texto';
  dato: string;
  fuente: keyof typeof StandardFonts;
  tamanoFuente: number;
  longitud?: number;
  color: string;
}

export interface ElementoNumero extends ElementoBase {
  tipo: 'numero';
  dato: string;
  fuente: keyof typeof StandardFonts;
  tamanoFuente: number;
  color: string;
  margenDerecho: number;
  simbolo?: string;
  miles?: boolean;
  atras?: boolean;
  colorNegativo?: string
  cerosIzquierda?: number;
  decimales: number;
}

export interface ElementoFecha extends ElementoBase {
  tipo: 'fecha';
  dato: Date;
  formato: string;
  color: string;
  fuente: keyof typeof StandardFonts;
  tamanoFuente: number;
  locale: string;
  margenDerecho: number;
  alinearDerecha: boolean;
  // mostrarPlaceholder?: boolean;

}

export interface ElementoLinea extends ElementoBase {
  tipo: 'linea';
  x2: number;
  y2: number;
  grosor: number;
  color: string;
}

export interface ElementoRectangulo extends ElementoBase {
  tipo: 'rectangulo';
  x: number;
  y: number;
  ancho?: number;
  alto?: number;
  bordeGrosor?: number;
  bordeColor?: string;
  colorRelleno?: string;
  opacidadRelleno?: number;
  opacidadBorde?: number;
}

export interface ElementoImagen extends ElementoBase {
  tipo: 'imagen';
  ruta: string;
  x: number;
  y: number;
  ancho: number;
  alto: number;
}

export type RamaElemento =
  | ElementoTexto
  | ElementoNumero
  | ElementoFecha
  | ElementoLinea
  | ElementoRectangulo
  | ElementoImagen

// --- COLUMNAS ---
export interface RamaColumna extends NodoBase { // Extiende de NodoBase
  orden: number;
  titulo: string;
  xInicio: number;
  xFin: number;
  ancho: number;
  fuente: keyof typeof StandardFonts
  tamanoFuente?: number;
  color?: string;
  fondoColumna?: string;
  elementos: (ElementoTexto | ElementoNumero | ElementoFecha | ElementoImagen)[];
  multiline?: boolean;
}

