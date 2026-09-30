import { DocumentChangeAction } from '@angular/fire/compat/firestore';

import { Timestamp } from '@firebase/firestore-types'; 

import { DipsUtils } from '../../../../@dips/utils';

// EJEMPLO DE ASIGNACION DE VALOR A UN BOOLEAN
//export type SponsorVisibility = 'Public' | 'Private';

export class Registro {

  uid: string;
  nombre: string;
  fechaInicio: Date
  fechaFin: Date
  automatico: boolean;
  fueSucia: boolean;
  importe: number;
  promo: string



  constructor(dato?: any)
  {
  
      dato = dato || {};
      this.uid = dato.uid || ''
      this.nombre = dato.nombre || '';
      this.fechaInicio = dato.fechaInicio || 0
      this.fechaFin = dato.fechaFin || 0
      this.automatico = dato.automatico || false;
      this.fueSucia = dato.fueSucia || false;
      this.importe = dato.importe || 0;
      this.promo = dato.promo || ''
  }
}

export interface RegistroListadoRequest {

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

export type RegistroListadoItem = DocumentChangeAction<Registro>;

