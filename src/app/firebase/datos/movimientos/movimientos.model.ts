import { DocumentChangeAction } from '@angular/fire/compat/firestore';

export class Movimientos {

  uid: string;
  nombre: string;

  horaInicio: number;
  horaFin: number;
  estadia: number;

  estado: string;
  precio: number;             // Precio de habitacion 
  promoNombre: string;
  promoUID: string;

  nota: string;

  usuario: string;
  uidUsuario: string;

  constructor(dato?: any) {
  
      dato = dato || {};
      this.uid = dato.uid || '';  
      this.nombre = dato.nombre || '';

      this.horaInicio = dato.horaInicio || 0;
      this.horaFin = dato.horaFin || 0;
      this.estadia = dato.estadia || 0;

      this.estado = dato.estado || '';
      this.precio = dato.precio || 0;
      this.promoNombre = dato.promoNombre || '';
      this.promoUID = dato.promoUID || '';

      this.nota = dato.nota || '';

      this.usuario = dato.usuario || ''
      this.uidUsuario = dato.uidUsuario || ''

  }
}

export interface MovimientosListadoRequest {

  // buscar
  buscar?: Array<any>;

  // filtros
//  filtro?: string;
  
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

export type MovimientosListadoItem = DocumentChangeAction<Movimientos>;

