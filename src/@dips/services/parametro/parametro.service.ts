import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { BehaviorSubject, Observable}  from 'rxjs';

import { albergoParametro } from './parametro.model';

import { FireBDService } from 'src/app/firebase/servicios/firebase.service';

// Caja
import { CajasDatabase } from 'src/app/firebase/datos/cajas';
import { Cajas } from 'src/app/firebase/datos/cajas';


@Injectable({
  providedIn: 'root'
})
export class DipsParametroService {

  /**
   *
   *
   * @private
   * @type {*}
   * @memberof DipsParametroService
   * 
   * Este servicio lleva e informa los parametros globales.
   * el componente app/layout/components/navbar/vertical/style-1
   * lo dispara. y se mantiene activo en toda la aplicacion consultando
   * variable parametros creada para tal fin.
   * 
   * la variable parametros se lee y se actualiza con
   * getParametros y setParametros respectivamente
   * 
   */
  private usuario: any;  
  private parametros: BehaviorSubject<albergoParametro>;

  public dialogoAbierto: boolean = false;

  // Cajas
  //private _datosCaja: Cajas;
  
  constructor(
        private db: AngularFirestore,
        private _dbConfig: FireBDService,
        private _cajaDB: CajasDatabase,
        ) {

        this.parametros = new BehaviorSubject<albergoParametro>(new albergoParametro);

  }

  /**
   *  traeConfiguracion
   * @param idCuenta 
   * 
   * el archivo PARAMETROS es uno por cada cuenta y se accede con el dato de la cuenta.
   * esta funcion trae los datos del archivo
   * 
   */
   traeConfiguracion(idCuenta: any) {

    return this.db.collection<albergoParametro>('parametros').doc(idCuenta).snapshotChanges()

  }

  /**
   *  Inicializa
   * @param idCuenta 
   * 
   * esta funcion inicializa el archivo PARAMETROS si este no existe
   * 
   * esta funcion suministra los datos por defecto del sistema
   * 
   */
  async inicializa(idCuenta: any) {

//    const parametroRef = await this.db.collection<albergoParametro>('parametros').doc('/' + idCuenta)
  
    // Datos por Defecto
    const datos: albergoParametro = {
      uid:      idCuenta,

      sensibilidadCuarto: 3000, 
      sensibilidadGarage: 7000,
  
      // Tiempos
      tiempoCuartoOn: 240,
      tiempoGarageOn: 240,    
  
      tiempoStandard: 60, 
      tiempoAviso: 5, 
      tiempoGracia: 10, 

      tiempoLimpieza: 20,
      tiempoSucia: 60

    }

    

//    await parametroRef.set(datos, { merge: true });

    // salva en base de datos firebase
    this._dbConfig.parametros(datos);


  }

  async actualizaDato(idCuenta: any, info: any) {
 
    return await this.db.collection<albergoParametro>('parametros').doc('/' + idCuenta).update(info);
  
  }


  /**
   *  getParametros
   * 
   * esta informa el dato de la varialbe parametros
   */
  getParametros(): Observable<albergoParametro> {
    return this.parametros.asObservable();
  }

  /**
   *  setParametros
   * @param nuevoParametro 
   * 
   * fija los nuevos datos en la variable
   */
  setParametros(nuevoParametro: any): void {
    this.parametros.next(nuevoParametro);
  }

  // ======================================================================
  // CAJAS 
  // ======================================================================

  abreCaja(parametros: any) {

    const datosCaja = {
      cerrada: false,
      fecha: new Date,
      emailEncargado: parametros.emailEncargado,
      uidEncargado: parametros.uidEncargado,
  
      egresos: 0,
      ingresos: 0,
      saldo: 0,      
      resumen: [],
    }

    this._cajaDB.ingresaDatoID(parametros.uidCaja, datosCaja)
    
  }

}
