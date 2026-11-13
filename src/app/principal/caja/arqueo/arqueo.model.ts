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

export const MEDIOS_PAGO: { codigo: string; clave: keyof TotalesCaja; nombre: string }[] = [
    { codigo: '0', clave: 'efectivo', nombre: 'Efectivo' },
    { codigo: '1', clave: 'debito', nombre: 'Tarjeta de débito' },
    { codigo: '2', clave: 'credito', nombre: 'Tarjeta de crédito' },
    { codigo: '3', clave: 'billetera', nombre: 'Billetera virtual' },
    { codigo: '4', clave: 'transferencia', nombre: 'Transferencia' },
    { codigo: '5', clave: 'cheque', nombre: 'Cheque' },
    { codigo: '6', clave: 'ctacte', nombre: 'Cuenta corriente' }
];


export interface MovimientoCaja {
    fechaInicio: Date;
    fechaFin?: Date;
    tipo: string;
    descripcion: string;
    monto: number;
    usuario: string;
    datos: string;  // 0 => efectivo,
                    // 1 => debito,
                    // 2 => credito,
                    // 3 => billetera,
                    // 4 => transferencia,
                    // 5 => cheque,
                    // 6 => ctacte,
                    // 7 => ajuste (positivo o negativo, afecta efectivo),
                    // 8 => gasto
                    // 9 => apertura,
                    // A => cierre
}

export class Caja {
    id: string;
    cerrada: boolean;
    puntoVenta: string;
    fechaApertura: Date;
    fechaCierre?: Date;
    montoInicial: number;
    montoCierre: number;
    movimientos: MovimientoCaja[];
    datos: number;
    totales: TotalesCaja;
    usuario: string;


    constructor(dato?: any) {
        dato = dato || {};
        this.id = dato.id || '';
        this.cerrada = dato.cerrada ?? true;
        this.puntoVenta = dato.puntoVenta || '';
        this.fechaApertura = dato.fechaApertura || new Date();
        this.fechaCierre = dato.fechaCierre;
        this.montoInicial = dato.montoInicial || 0;
        this.montoCierre = dato.montoCierre || 0;
        this.movimientos = dato.movimientos || (dato.gastos || []).map(
            (gasto: { descripcion: string; monto: number }): MovimientoCaja => ({
                fechaInicio: this.fechaApertura,
                tipo: gasto.monto < 0 ? 'Gasto' : 'Ingreso',
                descripcion: gasto.descripcion,
                monto: gasto.monto,
                usuario: dato.usuario || '',
                datos: gasto.monto < 0 ? '8' : '7'
            })
        );
        this.datos = dato.datos || 0;
        this.totales = dato.totales || {
            movimientos: 0, efectivo: 0, debito: 0, credito: 0,
            billetera: 0, transferencia: 0, cheque: 0, ctacte: 0
        };
        this.usuario = dato.usuario || '';
    }
}
// Los movimientos manuales afectan el efectivo; los otros medios ya están en totales.
export function totalMovimientosManuales(caja: Caja | null): number {
    return (caja?.movimientos || [])
        .filter(movimiento => movimiento.datos === '7' || movimiento.datos === '8')
        .reduce((total, movimiento) => total + (Number(movimiento.monto) || 0), 0);
}
