import { ControlValueAccessor } from '@angular/forms';
import { DocumentChangeAction } from '@angular/fire/compat/firestore';
//import { Timestamp } from '@firebase/firestore-types'; 

// --------------------------------------------------------------------------------------
// Usuarios
// --------------------------------------------------------------------------------------
export class Usuarios {
        nombre?: string;
        email?: string;
        busqueda?: string[];
        telefono?: string;
        foto?: string;
        tipoAdmin?: boolean;
        tipoEncargado?: boolean;
        titulo?: string;            // Titulo del Cargo en la empresa

        // Cuenta asociada
        idCuenta?: string;
        emailCuenta?: string;
        estado?: string;

        // Generales
        uid?: string;
        fechaCreacion?: string;
        fechaUltimoIngreso?: string;
        fechaVencimiento?: Date;
        sesion?: string;
        onLine?: boolean;               // ESTA PENDINTE DE HACER

    constructor(dato?: any) {
    
        dato = dato || {};

        // Usuario
        this.nombre = dato.nombre || '';
        this.email = dato.email || '';
        this.busqueda = dato.busqueda || [];
        this.telefono = dato.telefono || '';
        this.foto = dato.foto || '';
        this.tipoAdmin = dato.tipoAdmin || false;
        this.tipoEncargado = dato.tipoEncargado || false;

        // Cuenta
        this.idCuenta = dato.idCuenta || '';
        this.emailCuenta = dato.emailCuenta || '';
        this.estado = dato.estado || '';

        // Generales
        this.uid = dato.uid || '';
        this.fechaCreacion = dato.fechaCreacion || '';
        this.fechaUltimoIngreso = dato.fechaUltimoIngreso || '';
        this.fechaVencimiento = dato.fechaVencimiento || Date;
        this.sesion = dato.sesion || '';
        this.onLine = dato.onLine || true;

    }
    
}

/**  CLAVES USUARIOS
 * 
 *   con busqueda activado
 * 
 *      - Busqueda array    Nombre Asc
 *      - Busqueda array    Nombre Desc
 *      - Busqueda array    email Asc
 *      - Busqueda array    email Desc
 * 
 *  con Filtro
 * 
 *      - idCuenta Asc  Nombre Asc
 *      - idCuenta Asc  Nombre Desc
 *      - idCuenta Asc  email Asc
 *      - idCuenta Asc  email Desc
 * 
*/






// --------------------------------------------------------------------------------------
// Cuentas
// --------------------------------------------------------------------------------------
export class Cuentas {

        email?: string;
        nombre?: string;
        busqueda?: string[];
        eslogan?: string;
        foto?: string;
        comparteCuenta?: boolean;

        // Generales
        uid?: string;
        fechaCreacion?: string;
        fechaUltimoIngreso?: Date;

    constructor(dato?: any) {
    
        dato = dato || {};

        this.email = dato.email || '';
        this.nombre = dato.nombre || '';
        this.busqueda = dato.busqueda || [];
        this.eslogan = dato.eslogan || '';
        this.foto = dato.foto || '';
        this.comparteCuenta = dato.comparteCuenta || false;

        // Generales
        this.uid = dato.uid || '';
        this.fechaCreacion = dato.fechaCreacion || '';
        this.fechaUltimoIngreso = dato.fechaUltimoIngreso || Date;

    }    
}

// --------------------------------------------------------------------------------------
// OPCIONES
// --------------------------------------------------------------------------------------

// export interface Estados {
//     activo?: boolean;
//     pendiente?: boolean;
//     rechazado?: boolean;


// }
 
// --------------------------------------------------------------------------------------
// Requerimientos de filtros de source
// --------------------------------------------------------------------------------------

export interface UsuariosListadoRequest {

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

export type UsuariosListadoItem = DocumentChangeAction<Usuarios>;

