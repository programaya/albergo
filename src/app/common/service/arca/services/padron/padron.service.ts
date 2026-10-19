import { Injectable, OnDestroy } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, from, Subscription } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { environment } from '@envs/environment';
import { ArcaError } from '@cf/factura/arca/errores';

// Servicios
import { DipsUsuarioService } from '@serv/usuario/usuario.service';
import { DipsAlertaService } from '@serv/alerta/dips-alerta.service';
import { getStorage, ref, getDownloadURL } from 'firebase/storage';

/**
 * Tipos de documento soportados por AFIP
 */
export const TIPOS_DOCUMENTO = {
    CUIT: 80,
    CUIL: 86,
    // CDI: 87,
    // LE: 89,
    // LC: 90,
    // CI_EXTRANJERA: 91,
    DNI: 96
} as const;

export type TipoDocumento = typeof TIPOS_DOCUMENTO[keyof typeof TIPOS_DOCUMENTO];

/**
 * Solicitud para consultar Padrón A13
 */
export interface SolicitudConsultaPadron {
    tipoDocumento: number;
    nroDocumento: string;
}

/**
 * Datos fiscales COMPLETOS del Padrón A13
 */
export interface DatosFiscales {
    // Identificación
    idPersona?: string | null;
    tipoPersona: string;
    tipoClave?: string | null;
    numeroDocumento: string;

    // Nombre/Razón Social
    apellido?: string | null;
    nombre?: string | null;
    razonSocial?: string | null;

    // Estado y fechas
    estadoClave: string;
    fechaInicioActividades?: Date | null;
    fechaCierre?: Date | null;

    // Condición tributaria
    condicionIVA?: string | null;
    tipoContribuyente?: string | null;

    // Domicilio fiscal COMPLETO
    domicilioFiscal?: {
        tipoDomicilio?: string | null;
        direccion?: string | null;
        localidad?: string | null;
        codPostal?: string | null;
        provincia?: string | null;
        pais?: string | null;
        departamento?: string | null;
        codLocalidad?: string | null;
    } | null;

    // Actividades económicas
    actividades?: Array<{
        codigo?: string | null;
        descripcion?: string | null;
        orden?: number | null;
        periodoDesde?: Date | null;
        periodoHasta?: Date | null;
    }>;

    // Impuestos
    impuestos?: Array<{
        codigo?: string | null;
        descripcion?: string | null;
        periodoDesde?: Date | null;
        periodoHasta?: Date | null;
    }>;
}

/**
 * Respuesta del servicio Padrón A13
 */
export interface RespuestaConsultaPadronA13 {
    success: boolean;
    data?: DatosFiscales | null;
    error?: string | null;
    details?: string | null;
}

@Injectable({
    providedIn: 'root'
})
export class PadronService implements OnDestroy {
    // URLs directas según modo demo usando environment
    private readonly URL_OBTIENE_DATOS_FISCALES = !environment.production
        ? 'http://localhost:5001/gessi-dips/us-central1/obtieneDatosFiscales'
        : 'https://us-central1-gessi-dips.cloudfunctions.net/obtieneDatosFiscales';

    cuentaDatos: any;
    pathCertificado: string = '';
    puntoVenta: any;
    private cuentaSubscription?: Subscription;

    constructor(
        private _usuarioService: DipsUsuarioService,
        private _http: HttpClient,
        private _dipsAlertaService: DipsAlertaService,
    ) {
        // Obtener datos de cuenta
        this.cuentaSubscription = this._usuarioService.cuenta$.subscribe((cuenta) => {
            this.cuentaDatos = cuenta;
            if (cuenta && cuenta.fiscal?.cuit) {
                this.pathCertificado = `${this._usuarioService.coleccionCuentas}/${this.cuentaDatos.uid}/certificados/`;
                this.puntoVenta = this._usuarioService.getPuntoVentaActual;
            } else {
                console.warn('Datos de cuenta incompletos o sin CUIT fiscal');
            }
        });
    }

    ngOnDestroy(): void {
        this.cuentaSubscription?.unsubscribe();
    }

    /**
     * Consulta datos fiscales por CUIT
     * @param cuit CUIT del contribuyente (con o sin guiones)
     * @returns Observable con los datos fiscales
     */
    consultarPorCUIT(cuit: string): Observable<DatosFiscales> {
        const cuitLimpio = cuit.replace(/[-.]/g, '');

        if (!this.validarCUIT(cuitLimpio)) {
            return throwError(() => new Error('Formato de CUIT inválido. Debe tener 11 dígitos.'));
        }

        const solicitud: SolicitudConsultaPadron = {
            tipoDocumento: TIPOS_DOCUMENTO.CUIT,
            nroDocumento: cuitLimpio
        };

        return this.consultar(solicitud);
    }

    /**
     * Consulta datos fiscales por DNI
     * @param dni DNI del contribuyente
     * @returns Observable con los datos fiscales
     */
    consultarPorDNI(dni: string): Observable<DatosFiscales> {
        const dniLimpio = dni.replace(/[.]/g, '');

        if (!this.validarDNI(dniLimpio)) {
            return throwError(() => new Error('Formato de DNI inválido. Debe tener entre 7 y 8 dígitos.'));
        }

        const solicitud: SolicitudConsultaPadron = {
            tipoDocumento: TIPOS_DOCUMENTO.DNI,
            nroDocumento: dniLimpio
        };

        return this.consultar(solicitud);
    }

    /**
     * Consulta datos fiscales por tipo y número de documento
     * @param tipoDocumento Tipo de documento (CUIT, DNI, etc.)
     * @param nroDocumento Número de documento
     * @returns Observable con los datos fiscales
     */
    consultarPorDocumento(tipoDocumento: TipoDocumento, nroDocumento: string): Observable<DatosFiscales> {
        const solicitud: SolicitudConsultaPadron = {
            tipoDocumento,
            nroDocumento
        };

        return this.consultar(solicitud);
    }

    /**
     * Método privado para realizar la consulta real
     */
    private consultar(solicitud: SolicitudConsultaPadron): Observable<DatosFiscales> {
        return from(this._obtenerCredenciales()).pipe(
            switchMap(credenciales => {
                console.log('Preparando solicitud para Padrón A13:', credenciales);
                const body = {
                    credenciales,
                    solicitud,
                    demo: !environment.production
                };

                console.log('Enviando solicitud al servicio Padrón A13:', body);

                return this._http.post<RespuestaConsultaPadronA13>(
                    this.URL_OBTIENE_DATOS_FISCALES.trim(),
                    body
                ).pipe(
                    map(response => {
                        if (response.success && response.data) {
                            return response.data;
                        } else {
                            throw new ArcaError(
                                response.error || 'Error al consultar Padrón A13',
                                'PADRON_CONSULTA_ERROR',
                                response.details || 'Respuesta sin datos fiscales'
                            );
                        }
                    })
                );
            }),
            catchError(this.handleError)
        );
    }

    /**
     * Obtiene credenciales desde el almacenamiento local
     */
    private async _obtenerCredenciales(): Promise<any> {
        if (!this.cuentaDatos || !this.cuentaDatos.fiscal?.cuit) {
            throw new Error('No hay datos de cuenta disponibles. Por favor, inicie sesión.');
        }

        try {
            const certUrl = await this._obtenerUrlDescarga(this.pathCertificado + 'arca.crt');
            const keyUrl = await this._obtenerUrlDescarga(this.pathCertificado + 'arca.key');

            const credenciales = {
                certUrl: certUrl,
                keyUrl: keyUrl,
                cuit: this.cuentaDatos.fiscal.cuit,  // cuit del emisor
                //                puntoVenta: this.puntoVenta,
                pathCuenta: `${this._usuarioService.coleccionCuentas}/${this.cuentaDatos.uid}/`
            };

            console.log('Credenciales obtenidas:', credenciales);
            return credenciales;

        } catch (error) {
            this._dipsAlertaService.danger('Error al preparar la consulta', '', 3000, true);
            throw new Error('No se pudieron obtener las credenciales del usuario. Por favor, inicie sesión nuevamente.');
        }
    }

    private async _obtenerUrlDescarga(ruta: string): Promise<string> {
        try {
            const storage = getStorage();
            const fileRef = ref(storage, ruta);
            const url = await getDownloadURL(fileRef);
            return url;
        } catch (error: any) {
            console.error('Error al obtener URL de descarga para la ruta:', ruta, error);

            if (error.code === 'storage/object-not-found') {
                throw new Error(`El archivo no existe en la ruta: ${ruta}`);
            } else if (error.code === 'storage/unauthorized') {
                throw new Error(`No tienes permisos para acceder al archivo: ${ruta}`);
            } else if (error.code === 'storage/unknown') {
                throw new Error(`Error desconocido al acceder al archivo: ${ruta}`);
            } else {
                throw new Error(`Error al obtener URL de descarga: ${error.message}`);
            }
        }
    }

    /**
     * Valida formato de CUIT (11 dígitos)
     */
    private validarCUIT(cuit: string): boolean {
        return /^\d{11}$/.test(cuit);
    }

    /**
     * Valida formato de DNI (7 u 8 dígitos)
     */
    private validarDNI(dni: string): boolean {
        return /^\d{7,8}$/.test(dni);
    }

    /**
     * Manejador de errores genérico
     */
    private handleError(error: HttpErrorResponse | any): Observable<never> {
        let errorMessage = 'Error desconocido';

        if (error instanceof ArcaError) {
            errorMessage = error.message;
        } else if (error.error instanceof ErrorEvent) {
            errorMessage = `Error del lado del cliente: ${error.error.message}`;
        } else if (error.status === 0) {
            errorMessage = 'No se pudo conectar con el servidor. Verifica que las Cloud Functions estén corriendo.';
        } else if (error.status === 200 && typeof error.error === 'string' && error.error.includes('<!DOCTYPE')) {
            errorMessage = 'Error: se recibió HTML en lugar de JSON. Verifica que las Cloud Functions estén corriendo.';
        } else if (error.error?.error) {
            errorMessage = error.error.error;
            if (error.error.details) {
                errorMessage += ` - ${error.error.details}`;
            }
        } else if (error.message) {
            errorMessage = error.message;
        }

        console.error('Error en PadronService:', errorMessage, error);
        return throwError(() => new Error(errorMessage));
    }

    /**
     * Formatea CUIT con guiones (ej: 20-12345678-9)
     */
    formatearCUIT(cuit: string): string {
        const cuitLimpio = cuit.replace(/[-.]/g, '');
        if (cuitLimpio.length === 11) {
            return `${cuitLimpio.substring(0, 2)}-${cuitLimpio.substring(2, 10)}-${cuitLimpio.substring(10)}`;
        }
        return cuit;
    }

    /**
     * Formatea DNI con puntos (ej: 25.123.456)
     */
    formatearDNI(dni: string): string {
        const dniLimpio = dni.replace(/[.]/g, '');
        if (dniLimpio.length === 8) {
            return `${dniLimpio.substring(0, 2)}.${dniLimpio.substring(2, 5)}.${dniLimpio.substring(5)}`;
        } else if (dniLimpio.length === 7) {
            return `${dniLimpio.substring(0, 1)}.${dniLimpio.substring(1, 4)}.${dniLimpio.substring(4)}`;
        }
        return dni;
    }

    /**
     * Obtiene la descripción del tipo de documento
     */
    getDescripcionTipoDocumento(tipo: TipoDocumento): string {
        const tipos: Record<TipoDocumento, string> = {
            [TIPOS_DOCUMENTO.CUIT]: 'CUIT',
            [TIPOS_DOCUMENTO.CUIL]: 'CUIL',
            // [TIPOS_DOCUMENTO.CDI]: 'CDI',
            // [TIPOS_DOCUMENTO.LE]: 'LE',
            // [TIPOS_DOCUMENTO.LC]: 'LC',
            // [TIPOS_DOCUMENTO.CI_EXTRANJERA]: 'CI Extranjera',
            [TIPOS_DOCUMENTO.DNI]: 'DNI'
        };
        return tipos[tipo] || 'Documento';
    }

    /**
     * Determina si el contribuyente es persona física
     */
    esPersonaFisica(datos: DatosFiscales): boolean {
        return datos.tipoPersona?.toUpperCase() === 'FISICA';
    }

    /**
     * Determina si el contribuyente está activo
     */
    estaActivo(datos: DatosFiscales): boolean {
        return datos.estadoClave?.toUpperCase() === 'ACTIVO';
    }

    /**
     * Obtiene el nombre completo (para personas físicas)
     */
    getNombreCompleto(datos: DatosFiscales): string {
        if (datos.razonSocial) return datos.razonSocial;
        if (datos.apellido && datos.nombre) {
            return `${datos.apellido}, ${datos.nombre}`;
        }
        return datos.nombre || datos.apellido || 'Sin nombre';
    }
}