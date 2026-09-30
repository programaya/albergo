import { DocumentChangeAction } from '@angular/fire/compat/firestore';

export class Cajas {

  uid: string;
  emailEncargado: string;
  uidEncargado: string;
  fecha: number;
  fechaCierre: number;
  ingresos: number;
  egresos: number;
  saldo: number;
  cerrada: boolean;
  claves: string[];
  resumen: [];

  constructor(dato?: any) {

    dato = dato || {};
      this.uid = dato.uid || '';  
      this.emailEncargado = dato.emailEncargado || '';
      this.uidEncargado = dato.uidEncargado || '';
      this.fecha = dato.fecha || 0;
      this.fechaCierre = dato.fechaCierre || 0;
      this.ingresos = dato.ingresos || 0;
      this.egresos = dato.egresos || 0;
      this.saldo = dato.saldo || 0;
      this.cerrada = dato.cerrada || false;
      this.claves = dato.claves || [];
      this.resumen = dato.resumen || [];

  }
}

export interface CajasListadoRequest {

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

export type CajasListadoItem = DocumentChangeAction<Cajas>;

