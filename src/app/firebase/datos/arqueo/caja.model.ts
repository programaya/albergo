// app/principal/caja/caja.model.ts
import { DocumentChangeAction } from '@angular/fire/compat/firestore';

export interface Gasto {
    descripcion: string;
    monto: number;
}

export interface TotalesCaja {
    movimientos: number;
    efectivo: number;
    debito: number;
    credito: number;
    billetera: number;
    transferencia: number;
    cheque: number;
    ctacte: number;
}

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

    // === NUEVOS CAMPOS PARA ARQUEO ===
    id?: string;
    puntoVenta?: number;
    fechaApertura?: Date | null;
    montoInicial?: number;
    montoCierre?: number;
    gastos?: Gasto[];
    datos?: number;
    totales?: TotalesCaja;
    usuario?: string;

    constructor(dato?: any) {
        dato = dato || {};
        // Campos originales
        this.uid = dato.uid || '';
        this.emailEncargado = dato.emailEncargado || '';
        this.uidEncargado = dato.uidEncargado || '';
        this.fecha = dato.fecha || 0;
        this.fechaCierre = dato.fechaCierre || 0;
        this.ingresos = dato.ingresos || 0;
        this.egresos = dato.egresos || 0;
        this.saldo = dato.saldo || 0;
        this.cerrada = dato.cerrada !== undefined ? dato.cerrada : false;
        this.claves = dato.claves || [];
        this.resumen = dato.resumen || [];

        // Nuevos campos
        this.id = dato.id || '';
        this.puntoVenta = dato.puntoVenta || 0;
        this.fechaApertura = dato.fechaApertura || null;
        this.montoInicial = dato.montoInicial || 0;
        this.montoCierre = dato.montoCierre || 0;
        this.gastos = dato.gastos || [];
        this.datos = dato.datos || 0;
        this.totales = dato.totales || {
            movimientos: 0, efectivo: 0, debito: 0, credito: 0,
            billetera: 0, transferencia: 0, cheque: 0, ctacte: 0
        };
        this.usuario = dato.usuario || '';
    }
}

// Alias para compatibilidad con el nuevo código
export type Caja = Cajas;

export interface CajasListadoRequest {
    buscar?: Array<any>;
    filtro?: string;
    orderBy?: string;
    orderDir?: 'desc' | 'asc';
    pageIndex?: number;
    pageSize?: number;
    limit?: number;
    startAt?: Array<any>;
    startAfter?: Array<any>;
    endAt?: Array<any>;
    endBefore?: Array<any>;
}

export type CajasListadoItem = DocumentChangeAction<Cajas>;