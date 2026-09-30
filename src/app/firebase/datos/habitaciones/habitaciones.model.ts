import { DocumentChangeAction } from '@angular/fire/compat/firestore';
import { Promociones } from '../promociones';

export class Habitaciones {

  uid: string;
  nombre: string;
  // busca: string;
  // estadia: number;
  // valor: number;
  promos: Array<Promociones>;
  // nombrePromo: string;
  // uidPromo: string;
  // sensorGarage: string;
  // sensorCuarto: string;
  // ocupada: boolean;

  // horaInicio: number;
  // horaFin: number;

  // estado: string;
  // importe: number;
  // abonado: number;
  // ingreso: number;

  // flagAviso: boolean;
  // flagGracia: boolean;
  // flagPeriodo: boolean;

  // nota: string;

  // usuario: string;
  // uidUsuario: string;

  constructor(dato?: any) {
  
      dato = dato || {};
      this.uid = dato.uid || '';  
      this.nombre = dato.nombre || '';
      // this.busca = dato.busca || '';
      // this.estadia = dato.estadia || 0;
      // this.valor = dato.valor || 0;
      this.promos = dato.promos || [];
      // this.nombrePromo = dato.nombrePromo || '';
      // this.uidPromo = dato.uidPromo || '';
      // this.sensorGarage = dato.sensorGarage || '';
      // this.sensorCuarto = dato.sensorCuarto || '';
      // this.ocupada = dato.ocupada || false;

      // this.horaInicio = dato.horaInicio || 0;
      // this.horaFin = dato.horaFin || 0;

      // this.estado = dato.estado || '';
      // this.importe = dato.importe || 0;
      // this.abonado = dato.abonado || 0;
      // this.ingreso = dato.ingreso || 0

      // this.flagAviso = dato.flagAviso || false;
      // this.flagGracia = dato.flagGracia || false;
      // this.flagPeriodo = dato.flagPeriodo || false;

      // this.nota = dato.nota || '';

      // this.usuario = dato.usuario || ''
      // this.uidUsuario = dato.uidUsuario || ''

  }
}

export interface HabitacionesListadoRequest {

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

export type HabitacionesListadoItem = DocumentChangeAction<Habitaciones>;

