import { Injectable } from '@angular/core';
import { AngularFirestore, CollectionReference, Query } from '@angular/fire/compat/firestore';

import { Registro, RegistroListadoRequest, RegistroListadoItem } from './registro.model';
import { DipsUtils } from '../../../../@dips/utils';

import { DipsUsuarioService } from 'src/@dips/services/usuario.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class RegistroDatabase {

  // Datos Generales MODIFICAR
  coleccion: any = 'registro';  // poner la coleccion y el nombre correspondiente
  orden: any = 'fechaInicio';

  private _coleccionBase: any = ''

  // Usuario 
  private usuario: any;

  /**
   * La Database traslada los requerimientos de Datasource a el backend.
   */
  constructor(
    private db: AngularFirestore,
    private _dipsUsuarioService: DipsUsuarioService,
  ) {

    // enviroment de prueba o produccion
    if (environment.production) {
      this._coleccionBase = 'cuentas'

    } else {
      this._coleccionBase = 'zTest-cuentas'
    }

    // Usuario 
    this._dipsUsuarioService.getUsuario()
      .subscribe((usuario: any) => {
        if (usuario != null) {
          this.usuario = usuario;
        }
      });

  }

  /**
   * simple
   * @param id 
   * 
   * busca un determinado documento segun su identificacion
   */
  simple(id: string) {

    return this.db.collection(this._coleccionBase).doc(this.usuario.idCuenta).collection<Registro>(this.coleccion).doc(id).snapshotChanges()

  }

  /**
   * listado
   * @param args posee los argumentos para poder filtrar y paginar los registros
   * 
   * permite buscar los registros que se listaran en una tabla
   *
   */

  listado(args?: RegistroListadoRequest) {

    return this.db
      .collection(this._coleccionBase).doc(this.usuario.idCuenta)
      .collection<Registro>(this.coleccion, ref => {
        let query: CollectionReference | Query = ref;

        // buscar
        // if (args!.buscar) {
        //   query = query.where('claves', 'array-contains', args!.buscar)
        // }

        // filtro
        // if (args!.filtro) {
        //   query = query.where('apellido', '==', args!.filtro);
        // }

        // sorting
        if (!args!.orderBy) {
          args!.orderBy = this.orden;    // orden por defecto
        }

        if (!args!.orderDir) {
          args!.orderDir = 'desc'    // orden por defecto
        }

        query = query.orderBy(args!.orderBy!, args!.orderDir);

        // pagination
        if (args!.pageSize || args!.limit) {
          if (args!.startAt) {
            query = query.startAt(...args!.startAt);
          }
          if (args!.startAfter) {
            query = query.startAfter(...args!.startAfter);
          }
          if (args!.endAt) {
            query = query.endAt(...args!.endAt);
          }
          if (args!.endBefore) {
            query = query.endBefore(...args!.endBefore);
          }

          let limite = args!.limit || args!.pageSize || 0
          query = query.limit(limite);
        }

        return query;
      })
      .snapshotChanges();
  }

  /**
   * 
   * =====================================================
   * Funcions de ingreso actualizacion y borrado
   * =====================================================
   */
  async actualizaDato(id: any, info: any) {
    return await this.db.collection(this._coleccionBase).doc(this.usuario.idCuenta).collection<Registro>(this.coleccion).doc(id).update(info);
  }

  async ingresaDato(info: any) {

    console.log('[registro] INFO', info, this._coleccionBase, this.usuario.idCuenta, this.coleccion)
    //   return await this.db.collection(this._coleccionBase).doc(this.usuario.idCuenta).collection<Registro>(this.coleccion).add(info);
    try {
      // 2. Ejecución segura con captura de errores
      const docRef = await this.db.collection(this._coleccionBase)
        .doc(this.usuario.idCuenta)
        .collection<Registro>(this.coleccion)
        .add(info);

      console.log('[registro] ÉXITO: Documento creado con ID:', docRef.id);
      return docRef;

    } catch (error) {
      console.error('[registro] ERROR de Firestore:', error);
      throw error; // Propaga el error al componente para que lo muestre al usuario
    }


  }

  async borraDato(id: string) {
    return await this.db.collection(this._coleccionBase).doc(this.usuario.idCuenta).collection<Registro>(this.coleccion).doc(id).delete();
  }


  /**
   *  generalClaves
   * 
   * @param nombre 
   * @param apellido 
   * @param email 
   * 
   * los parametros se ajustan segun las necesidades de cada base de datos
   * esta funcion permite crear claves de busqueda para multiples campos
   * 
   */
  // generaClaves(nombre: string, apellido: string, email: string){ // se define los campos de busqueda

  //   // define posible datos faltantes agregar tantos como haga falta
  //   const campo1 = nombre.length > 0 ? `${nombre}` : '';
  //   const campo2 = apellido.length > 0 ? `${apellido}` : '';
  //   const campo3 = email.length > 0 ? `${email}` : '';

  //   // se define las mezclas que se desee tener en cuenta
  //   const claveNombreCompleto = DipsUtils.creaClaves(`${nombre} ${apellido}`);
  //   const claveApellidoPrimero = DipsUtils.creaClaves(`${apellido} ${nombre}`);
  //   const soloEmail = DipsUtils.creaClaves(`${email}`);

  //   // retorna array
  //   return [
  //     ...new Set([
  //       '',
  //       ...claveNombreCompleto,
  //       ...claveApellidoPrimero,
  //       ...soloEmail
  //     ])
  //   ];
  // }

}

