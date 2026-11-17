// Caja
// app/DBase/Modelos/caja.model.ts

// Modelo
export interface Caja {

  id: string; // Autonumerado
  cerrada: boolean;
  puntoVenta: number
  fechaApertura: Date;
  fechaCierre: Date;
  montoInicial: number;
  montoCierre: number
  totales: {
    movimientos: number;
    efectivo: number;
    debito: number;
    credito: number;
    billetera: number;
    transferencia: number;
    cheque: number;
  }

  gastos: Array<
    {
      descripcion: string; // Ejemplo: 'efectivo', 'tarjeta', etc.
      monto: number;
    }
  >
  datos: number;
  usuario: string;

}



// Inicializacion
export class Cajas implements Caja {

  id: string; // Autonumerado
  cerrada: boolean;
  puntoVenta: number
  fechaApertura: Date;
  fechaCierre: Date;
  montoInicial: number;
  montoCierre: number;
  totales: {
    movimientos: number;
    efectivo: number;
    debito: number;
    credito: number;
    billetera: number;
    transferencia: number;
    cheque: number;
    ctacte: number;
  };
  gastos: {
    descripcion: string;
    monto: number;
  }[];
  datos: number;
  usuario: string;

  //Sincronizacion
  createdAt!: '';
  updatedAt!: '';
  _localVersion!: 0;
  _deviceId!: '';
  _branchId!: '';
  _pendingSync!: false



  constructor(dato?: any) {

    dato = dato || {};

    // Generales
    this.id = dato.id || 0;
    this.cerrada = dato.cerrada || false;
    this.puntoVenta = dato.puntoVenta || 0;
    this.fechaApertura = dato.fechaApertura || new Date().toISOString();
    this.fechaCierre = dato.fechaCierre || new Date().toISOString();
    this.montoInicial = dato.montoInicial || 0;
    this.montoCierre = dato.montoCierre || 0;
    this.totales = dato.totales || {
      movimientos: 0,
      efectivo: 0,
      debito: 0,
      credito: 0,
      billetera: 0,
      transferencia: 0,
      cheque: 0,
      ctacte: 0
    };
    this.gastos = dato.gastos || [
      {
        descripcion: '', // Ejemplo: 'efectivo', 'tarjeta', etc.
        monto: 0
      }
    ];
    this.datos = dato.datos || 0;
    this.usuario = dato.usuario || '';

    // Sincronizacion
    this.createdAt = dato.createdAt || '';
    this.updatedAt = dato.updatedAt || '';
    this._localVersion = dato._localVersion || 0;
    this._deviceId = dato._deviceId || '';
    this._branchId = dato._branchId || '';
    this._pendingSync = dato._pendingSync || false;

  }

}


