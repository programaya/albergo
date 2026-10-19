// dips-dialogo.interface.ts
export type DipsDialogoType = 'success' | 'danger' | 'warning' | 'info' | 'light' | 'none';

export interface DipsDialogoData {
  titulo?: string;
  linea1: string;           // obligatoria
  linea2?: string;          // opcional
  linea3?: string;          // opcional
  btnAceptar?: string;
  btnCancela?: string;
  unBoton?: boolean;
  tipo?: DipsDialogoType;    // 'none' = sin estilo de alerta
}
