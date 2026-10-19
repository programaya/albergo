// src/app/common/service/arca/services/padron/padron.model.ts
/**
 * Solicitud para consultar Padrón A13
 */
export interface SolicitudConsultaPadron {
  tipoDocumento: number; // 80=CUIT, 96=DNI, 86=CUIL, 87=CDI, 89=LE, 90=LC
  nroDocumento: string;
}

/**
 * Datos fiscales COMPLETOS del Padrón A13
 */
export interface DatosFiscales {
  // Identificación
  idPersona?: string | null;
  tipoPersona: string; // "FISICA" | "JURIDICA"
  tipoClave?: string | null; // "CUIT" | "CUIL" | "CDI" | "DNI"
  numeroDocumento: string;

  // Nombre/Razón Social
  apellido?: string | null;
  nombre?: string | null;
  razonSocial?: string | null;

  // Estado y fechas
  estadoClave: string; // "ACTIVO" | "INACTIVO" | "BLOQUEADO"
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

  // Actividades económicas (array completo)
  actividades?: Array<{
    codigo?: string | null;
    descripcion?: string | null;
    orden?: number | null;
    periodoDesde?: Date | null;
    periodoHasta?: Date | null;
  }>;

  // Impuestos (array completo)
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
  data?: DatosFiscales | null; // ← Usar 'data' en lugar de 'datosFiscales'
  error?: string | null;
  details?: string | null;
}