import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { ArcaError } from '@cf/factura/arca/errores';
import { DatosFiscales } from '../padron/padron.service';

/**
 * Tipos de comprobante AFIP
 */
export const TIPOS_COMPROBANTE = {
    FACTURA_A: 1,
    NOTA_DEBITO_A: 2,
    NOTA_CREDITO_A: 3,
    FACTURA_B: 6,
    NOTA_DEBITO_B: 7,
    NOTA_CREDITO_B: 8,
    FACTURA_C: 11,
    NOTA_DEBITO_C: 12,
    NOTA_CREDITO_C: 13,
    FACTURA_M: 51,
    NOTA_DEBITO_M: 52,
    NOTA_CREDITO_M: 53
} as const;

export type TipoComprobante = typeof TIPOS_COMPROBANTE[keyof typeof TIPOS_COMPROBANTE];

/**
 * Tipos de concepto
 */
export const TIPOS_CONCEPTO = {
    PRODUCTOS: 1,
    SERVICIOS: 2,
    PRODUCTOS_Y_SERVICIOS: 3
} as const;

export type TipoConcepto = typeof TIPOS_CONCEPTO[keyof typeof TIPOS_CONCEPTO];

/**
 * Monedas
 */
export const MONEDAS = {
    PESO_ARGENTINO: 'PES',
    DOLAR_ESTADOUNIDENSE: 'DOL'
} as const;

export type Moneda = typeof MONEDAS[keyof typeof MONEDAS];

/**
 * Datos de una factura electrónica
 */
export interface FacturaElectronica {
    tipoComprobante: TipoComprobante;
    puntoVenta: number;
    concepto: TipoConcepto;
    tipoDocumento: number; // Código AFIP del tipo de documento
    nroDocumento: string;
    cbteDesde: number;
    cbteHasta: number;
    cbteFecha: string; // AAAAMMDD
    impTotal: number;
    impTotConc: number;
    impNeto: number;
    impOpEx: number;
    impTrib: number;
    impIVA: number;
    fchServDesde?: string; // AAAAMMDD (solo para servicios)
    fchServHasta?: string; // AAAAMMDD (solo para servicios)
    fchVtoPago?: string; // AAAAMMDD
    monId: Moneda;
    monCotiz: number;
    CanMisMonExt?: 'S' | 'N';
    CondIVAReceptorId?: number;
    CondIVAReceptorDesc?: string;
    cbtesAsoc?: Array<{
        tipo: number;
        ptoVta: number;
        nro: number;
        Cuit?: string;
        CbteFch?: string;
    }>;
    tributos?: Array<{
        id: number;
        desc?: string;
        baseImp: number;
        alic: number;
        importe: number;
    }>;
    iva?: Array<{
        id: number;
        baseImp: number;
        importe: number;
    }>;
    opcionales?: Array<{
        id: number;
        valor: string;
    }>;
    compradores?: Array<{
        docTipo: number;
        cocNro: string;
        porcentaje: number;
    }>;
    PeriodoAsoc?: Array<{
        FchDesde: string;
        FchHasta: string;
    }>;
    actividades?: Array<{
        id: number;
    }>;
}

/**
 * Respuesta de emisión de factura
 */
export interface RespuestaFactura {
    success: boolean;
    cae: string;
    caeFechaVencimiento?: Date;
    numero?: number;
    puntoVenta?: number;
    tipoComprobante?: number;
    message?: string;
    observaciones?: string[];
    eventos?: string[];
    error?: string;
    details?: string;
}

@Injectable({
    providedIn: 'root'
})
export class ArcaFacturacionService {
    private readonly API_URL = '/api/facturacion/emitir'; // Ajustar según tu configuración

    constructor(private http: HttpClient) { }

    /**
     * Emite una factura electrónica
     * @param factura Datos de la factura a emitir
     * @returns Observable con la respuesta de AFIP
     */
    emitirFactura(factura: FacturaElectronica): Observable<RespuestaFactura> {
        const body = {
            credenciales: this._obtenerCredenciales(),
            factura,
            demo: this.esAmbienteDemo()
        };

        return this.http.post<RespuestaFactura>(this.API_URL, body).pipe(
            map(response => {
                if (response.success) {
                    return response;
                } else {
                    throw new ArcaError(
                        response.error || 'Error al emitir factura',
                        'FACTURA_EMISION_ERROR',
                        response.details || 'Respuesta sin datos'
                    );
                }
            }),
            catchError(this.handleError)
        );
    }

    /**
     * Crea una factura a partir de datos del cliente y items
     */
    crearFacturaDesdeItems(
        cliente: DatosFiscales,
        items: Array<{
            cantidad: number;
            precioUnitario: number;
            descripcion: string;
            alicuotaIVA: number; // Código de alícuota
        }>,
        opciones: {
            tipoComprobante: TipoComprobante;
            puntoVenta: number;
            concepto: TipoConcepto;
        }
    ): FacturaElectronica {
        // Calcular totales
        const impNeto = items.reduce((sum, item) => sum + (item.cantidad * item.precioUnitario), 0);
        const impIVA = items.reduce((sum, item) => sum + (item.cantidad * item.precioUnitario * 0.21), 0); // IVA 21%
        const impTotal = impNeto + impIVA;

        // Determinar tipo de documento del cliente
        const tipoDocCliente = this.getTipoDocumentoCliente(cliente);

        return {
            tipoComprobante: opciones.tipoComprobante,
            puntoVenta: opciones.puntoVenta,
            concepto: opciones.concepto,
            tipoDocumento: tipoDocCliente.tipo,
            nroDocumento: tipoDocCliente.numero,
            cbteDesde: 0, // AFIP asignará el número
            cbteHasta: 0,
            cbteFecha: this.getFechaAFIP(),
            impTotal,
            impTotConc: 0,
            impNeto,
            impOpEx: 0,
            impTrib: 0,
            impIVA,
            monId: MONEDAS.PESO_ARGENTINO,
            monCotiz: 1.0,
            iva: [{
                id: 5, // IVA 21%
                baseImp: impNeto,
                importe: impIVA
            }]
        };
    }

    /**
     * Obtiene el tipo de documento del cliente según sus datos fiscales
     */
    private getTipoDocumentoCliente(cliente: DatosFiscales): { tipo: number; numero: string } {
        if (cliente.tipoClave === 'CUIT' || cliente.tipoClave === 'CUIL') {
            return { tipo: 80, numero: cliente.numeroDocumento };
        } else if (cliente.tipoClave === 'DNI') {
            return { tipo: 96, numero: cliente.numeroDocumento };
        } else {
            // Por defecto, usar DNI para personas físicas sin CUIT
            return { tipo: 96, numero: cliente.numeroDocumento };
        }
    }

    /**
     * Obtiene la fecha actual en formato AFIP (AAAAMMDD)
     */
    private getFechaAFIP(): string {
        const hoy = new Date();
        const año = hoy.getFullYear();
        const mes = String(hoy.getMonth() + 1).padStart(2, '0');
        const dia = String(hoy.getDate()).padStart(2, '0');
        return `${año}${mes}${dia}`;
    }

    /**
     * Obtiene credenciales desde el almacenamiento local
     */
    private _obtenerCredenciales(): any {
        const user = JSON.parse(localStorage.getItem('currentUser') || '{}');
        const cuenta = JSON.parse(localStorage.getItem('cuentaActiva') || '{}');

        return {
            certUrl: user.certUrl,
            keyUrl: user.keyUrl,
            cuit: cuenta.cuit || user.cuit,
            puntoVenta: cuenta.puntoVenta || 1,
            pathCuenta: cuenta.path || `cuentas/${user.uid}/`
        };
    }

    /**
     * Determina si estamos en ambiente de demostración
     */
    private esAmbienteDemo(): boolean {
        return window.location.hostname.includes('localhost') ||
            window.location.hostname.includes('homo') ||
            localStorage.getItem('ambienteDemo') === 'true';
    }

    /**
     * Manejador de errores
     */
    private handleError(error: HttpErrorResponse | any): Observable<never> {
        let errorMessage = 'Error desconocido';

        if (error instanceof ArcaError) {
            errorMessage = error.message;
        } else if (error.error instanceof ErrorEvent) {
            errorMessage = `Error: ${error.error.message}`;
        } else if (error.error?.error) {
            errorMessage = error.error.error;
            if (error.error.details) {
                errorMessage += ` - ${error.error.details}`;
            }
        } else if (error.message) {
            errorMessage = error.message;
        }

        console.error('Error en FacturacionService:', errorMessage, error);
        return throwError(() => new Error(errorMessage));
    }

    /**
     * Obtiene la descripción del tipo de comprobante
     */
    getDescripcionTipoComprobante(tipo: TipoComprobante): string {
        const tipos: Record<TipoComprobante, string> = {
            [TIPOS_COMPROBANTE.FACTURA_A]: 'Factura A',
            [TIPOS_COMPROBANTE.NOTA_DEBITO_A]: 'Nota de Débito A',
            [TIPOS_COMPROBANTE.NOTA_CREDITO_A]: 'Nota de Crédito A',
            [TIPOS_COMPROBANTE.FACTURA_B]: 'Factura B',
            [TIPOS_COMPROBANTE.NOTA_DEBITO_B]: 'Nota de Débito B',
            [TIPOS_COMPROBANTE.NOTA_CREDITO_B]: 'Nota de Crédito B',
            [TIPOS_COMPROBANTE.FACTURA_C]: 'Factura C',
            [TIPOS_COMPROBANTE.NOTA_DEBITO_C]: 'Nota de Débito C',
            [TIPOS_COMPROBANTE.NOTA_CREDITO_C]: 'Nota de Crédito C',
            [TIPOS_COMPROBANTE.FACTURA_M]: 'Factura M',
            [TIPOS_COMPROBANTE.NOTA_DEBITO_M]: 'Nota de Débito M',
            [TIPOS_COMPROBANTE.NOTA_CREDITO_M]: 'Nota de Crédito M'
        };
        return tipos[tipo] || `Comprobante ${tipo}`;
    }

    /**
     * Valida si una factura tiene errores
     */
    tieneErrores(respuesta: RespuestaFactura): boolean {
        return !respuesta.success || !!respuesta.error;
    }

    /**
     * Obtiene mensajes de observaciones formateados
     */
    getObservacionesFormateadas(respuesta: RespuestaFactura): string[] {
        if (!respuesta.observaciones) return [];

        return respuesta.observaciones.map(obs => {
            if (obs.includes(':')) {
                const [codigo, mensaje] = obs.split(':', 2);
                return `⚠️ [${codigo.trim()}] ${mensaje.trim()}`;
            }
            return `⚠️ ${obs}`;
        });
    }

    /**
     * Formatea el CAE con separadores
     */
    formatearCAE(cae: string): string {
        return cae.replace(/(\d{2})(\d{4})(\d{4})(\d{2})/, '$1-$2-$3-$4');
    }
}