// json-default.model.ts
import { StandardFonts } from 'pdf-lib';
import { TipoTronco, TroncoGeneral, TroncoTabla } from './json-estructura.model' // Ajusta la ruta según tu estructura

// Estructura de datos inicial con la nueva forma
export const estructuraConfiguracion: { [key in TipoTronco]: (TroncoGeneral | TroncoTabla) } = {
  general: {
    id: "general",
    nombre: "General",
    tipo: "general",
    tipoDocumento: 'standard',
    tamanoPapel: 'A4',
    orientacion: 'normal',
    fuente: 'Courier',
    tamanoFuente: 12,
    color: '#000000',
    alturaEncabezado: 50,
    alturaPie: 30,
    elementos: [
    ]
  },

  tabla: {
    id: "tabla",
    nombre: "Tabla",
    tipo: "tabla",
    x: 10,
    y: 60,
    ancho: 190,
    alto: 150,
    alturaFila: 10,
    alturaCabecera: 10,
    headerColor: "#58586bb8",
    headerTextColor: "#ffffff",
    bordeGrosor: 1,
    bordeColor: '#000000',
    cellPadding: 5,
    maxRowsPerPage: 20,
    columnas: [],
  }
}