export interface albergoParametro {
}


// --------------------------------------------------------------------------------------
// Parametros
// --------------------------------------------------------------------------------------
export class albergoParametro {

    sensibilidadCuarto?: number  // Sensibilidad sensor habitacion 1 = Alta, 2=Normal, 3=Media y 4=Baja
    sensibilidadGarage?: number  // Sensibilidad sensor Cochera

    // Tiempos
    tiempoCuartoOn?:    number  // segundos que deben pasar para considerar habitacion ocupada
    tiempoGarageOn?:    number  // segundos que deben pasar para considerar cochera ocupada   

    tiempoStandard?:    number // minutos de ocupacion si no es indicado en minutos
    tiempoAviso?:       number    // tiempo de aviso de vencimiento de periodo en minutos
    tiempoGracia?:      number   // tiempo de gracia de desalojo en minutos

    tiempoLimpieza?:    number  // tiempo en el que debe estar la habitacion sucia en minutos
    tiempoSucia?:       number  // tiempo maximo de que una habitacion esta sucia

    // Generales
    uid?: string;

    constructor(dato?: any) {
    
        dato = dato || {};

        this.sensibilidadCuarto = dato.sensibilidadCuarto || 2 
        this.sensibilidadGarage = dato.sensibilidadGarage || 4
    
        // Tiempos
        this.tiempoCuartoOn     = dato.tiempoCuartoOn  || 240
        this.tiempoGarageOn     = dato.tiempoGarageOn  || 240    
    
        this.tiempoStandard     = dato.tiempoStandard || 60 
        this.tiempoAviso        = dato.tiempoAviso    || 5 
        this.tiempoGracia       = dato.tiempoGracia   || 10 

        this.tiempoLimpieza     = dato.tiempoLimpieza || 20
        this.tiempoSucia        = dato.tiempoSucia    || 60
        
        // Generales
        this.uid                = dato.uid || '';
        // this.fechaCreacion      = dato.fechaCreacion || new Date
        // this.fechaUltimoIngreso = dato.fechaUltimoIngreso || new Date;

        // //Encargado
        // this.emailEncargado = dato.emailEncargado || '';
        // this.uidEncargado   = dato.uidEncargado || '';
        // this.cajaCerrada    = dato.cajaCerrada || false;
        // this.fechaEncargado = dato.fechaEncargado || Date;
        // this.uidCaja        = dato.uidCaja || '';

    }
    
}
