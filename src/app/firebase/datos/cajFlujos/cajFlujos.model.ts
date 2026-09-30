import { DocumentChangeAction } from '@angular/fire/compat/firestore';

// EJEMPLO DE ASIGNACION DE VALOR A UN BOOLEAN
//export type SponsorVisibility = 'Public' | 'Private';

export class CajFlujos {

  fecha: Date
  horaInicio: Date
  horaFin: Date
  habitacion: string
  promo: string
  promoUID: string
  detalle: string
  ingreso: number
  egreso: number
  saldo: number
  usuario: string
  uidUsuario: string
  claves: string[];



  constructor(dato?: any) {
  
      dato = dato || {};
      this.fecha = dato.fecha || 0
      this.horaInicio = dato.horaInicio || 0
      this.horaFin = dato.horaFin || 0
      this.habitacion = dato.habitacion || ''
      this.promo = dato.promo || ''
      this.promoUID = dato.promoUID || ''
      this.detalle = dato.detalle || ''
      this.ingreso = dato.ingreso || 0
      this.egreso = dato.egreso || 0
      this.saldo = dato.saldo || 0
      this.usuario = dato.usuario || ''
      this.uidUsuario = dato.uidUsuario || '' 
      this.claves = dato.claves || []

  }
}

export interface CajFlujosListadoRequest {

  // buscar
  buscar?: Array<any>;

  // filtros
  filtro?: string;
  
  // following?: boolean;
  // visibility?: SponsorVisibility;

  // sort
  orderBy?: string;
  orderDir?: 'desc' | 'asc';

  // pagination
  pageIndex?: number;
  pageSize?: number;
  limit?: number; // pageSize override for total check
  startAt?: Array<any>;
  startAfter?: Array<any>;
  endAt?: Array<any>;
  endBefore?: Array<any>;
}

export type CajFlujosListadoItem = DocumentChangeAction<CajFlujos>;

