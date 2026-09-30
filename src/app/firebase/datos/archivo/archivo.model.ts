import { DocumentChangeAction } from '@angular/fire/compat/firestore';

import { Timestamp } from '@firebase/firestore-types'; 

import { DipsUtils } from '../../../../@dips/utils';

// EJEMPLO DE ASIGNACION DE VALOR A UN BOOLEAN
//export type SponsorVisibility = 'Public' | 'Private';

export class Archivo {

  id: string;
  nombre: string;
  apellido: string;
  trabajo: string;
  area: string[];
  avatar: string;
  edad: number;
  email: string;
  web: string;
  telefono: number;
  claves: string[];

 
  // EJEMPLOS
  // email: string;
  // telefono: string;

  //publishDate?: Timestamp | Date; 
  // tier: number;
  // visibility: SponsorVisibility;
  // following: boolean;

  constructor(dato?: any)
  {
  
      dato = dato || {};
      this.id = dato.id || '';  
      this.nombre = dato.nombre || '';
      this.apellido = dato.apellido || '';
      this.trabajo = dato.trabajo || '';
      this.area = dato.area || [];
      this.avatar = dato.avatar || '';
      this.edad = dato.edad || '';
      this.email = dato.email || '';
      this.web = dato.web || '';
      this.telefono = dato.telefono || 0;
      this.claves = dato.claves || '';

      // EJEMPLOS
      // this.handle = product.handle || FuseUtils.handleize(this.name);
      // this.description = product.description || '';
      // this.categories = product.categories || [];
      // this.priceTaxExcl = product.priceTaxExcl || 0;
      // this.active = product.active || true;

  }
}

export interface ArchivoListadoRequest {

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

export type ArchivoListadoItem = DocumentChangeAction<Archivo>;

