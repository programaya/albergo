import { DocumentChangeAction } from '@angular/fire/compat/firestore';
import { Timestamp } from '@firebase/firestore-types'; 

export class Promociones {

  uid: string;
  nombre: string;
  semana: string[];
  horas: number[];
  claves: string[];
  permanencia: number;
  importe: number;
  activo: boolean;
  nota: string;

  diaPublicacion?: Timestamp | Date; 
  

  constructor(dato?: any) {
  
      dato = dato || {};
      this.uid = dato.uid || '';  
      this.nombre = dato.nombre || '';
      this.semana = dato.semana || [];
      this.horas = dato.horas || [];
      this.claves = dato.claves || [];
      this.permanencia = dato.permanencia || 0;
      this.importe = dato.importe || 0;
      this.activo = dato.activo || false;
      this.nota = dato.nota || '';

      this.diaPublicacion = dato.diaPublicacion || new Date;
  }
}

export interface PromocionesListadoRequest {

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

export type PromocionesListadoItem = DocumentChangeAction<Promociones>;

