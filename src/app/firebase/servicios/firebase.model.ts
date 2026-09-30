import { Timestamp } from '@firebase/firestore-types';
import { timestamp } from 'rxjs/operators';
// modelo de base de datos firebase

export interface TablaDatos {

  id: string; 
  nombre: string;             // nombre Habitacion
  automatico: boolean;        // automatico Sensor
  fueSucia: boolean           // estado previo sucia                  
  datos: string               //? aun no se ha pensado que contendra

  // Importes
  valor: number;              // valor de estadia
  pagado: number;             // monto ya pagado
  promoUID: string;
  
}

export interface TablaHabitacion {

  cuarto: boolean;            // sensado Cuarto
  garage: boolean;            // sensado Garage

  estado: number;             // estado ocupacion
          /* ESTADO
            1 Ocupada   hay gente en la habitacion
            2 Sucia     hay que limpiar la habitacion
            3 Limpieza  se esta limpiando la habitacion
            4 Vacia     habitacion libre
            0 Mantenimiento habitacion en mantenimiento fuera de servicio
          */

//    ocupada: boolean;           // habitacion Ocupada
  horaInicio: number;         // hora de Ingreso
  // horaFin: number;            // Hora de salida
  // estadia: number;            // tiempo de Estadia en la habitacion
  

  periodo: number             // periodo de estadia de ocupacion


  aviso: number;           // Estado de Aviso
    /* AVISO
        0 Sin Aviso Aumatico
        1 Aviso
        2 Periodo
        3 Gracia
    */

  // promoNombre: string;        // Nombre de la promo
//  promoUID: string;           // id de la promo

  // precio: number;
  // categoria: string;

}


export interface TablaItemUnido {
  // Tabla Datos Habitacion
  id: string; 
  nombre: string;             // nombre Habitacion
  automatico: boolean;        // automatico Sensor
  fueSucia: boolean           // estado previo sucia                  
  datos: string               //? aun no se ha pensado que contendra
  valor: number;              // valor de estadia
  pagado: number;             // monto ya pagado

  // Tabla Habitacion
  cuarto: boolean;            // sensado Cuarto
  garage: boolean;            // sensado Garage
  estado: number;             // estado ocupacion
  horaInicio: number;         // hora de Ingreso
  periodo: number             // periodo de estadia de ocupacion
  aviso: number;              // Estado de Aviso

  promoUID: string;           // id de la promo
  // precio: number;
  // categoria: string;
}

export interface TablaSensores {

      // Identificacion
  id: string
  garage: boolean
  
  // Sensibilidad
    // 1 = Alta, 2=Normal, 3=Media y 4=Baja
  sensCuarto: number    // Sensibilidad sensor Habitacion
  sensGarage: number    // Sensibilidad sensor Cochera
  
  // Tiempos
  tpoCuartoOn: number   // minutos que deben pasar para considerar habitacion ocupada
  tpoGarageOn: number   // minutos que deben pasar para considerar cochera ocupada 

  tpoAviso: number      // minutos de ocupacion si no es indicado en minutos
  tpoGracia: number     // tiempo de aviso de vencimiento de periodo en minutos
  tpoStandard: number   // tiempo de gracia de desalojo en minutos

  tpoLimpieza: number    // tiempo en el que debe estar la habitacion sucia en minutos
  tpoSucia: number       // tiempo maximo de que una habitacion esta sucia
   
}

export interface TablaUnidaSensor {
  id: string
  nombre: string

  garage: boolean
      
}
