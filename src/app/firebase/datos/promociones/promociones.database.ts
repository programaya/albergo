import { Injectable } from '@angular/core';
import { AngularFirestore, CollectionReference, Query } from '@angular/fire/compat/firestore';

import { Promociones, PromocionesListadoRequest, PromocionesListadoItem } from './promociones.model';
import { DipsUtils } from '../../../../@dips/utils';

import { DipsUsuarioService } from 'src/@dips/services/usuario.service';
import { Subject } from 'rxjs';
import { takeUntil, take, map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class PromocionesDatabase {

  // Datos Generales MODIFICAR
  coleccion: any = 'promociones';  // poner la coleccion y el nombre correspondiente
  orden: any = 'nombre';
  
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
          this._coleccionBase  = 'cuentas'  

        } else {
          this._coleccionBase = 'zTest-cuentas'
        }



        // Usuario 
        this._dipsUsuarioService.getUsuario()
              .subscribe((usuario: any) => {
                  this.usuario = usuario;
        });

      }

  /**
   * simple
   * @param id 
   * 
   * busca un determinado documento segun su identificacion
   */
  simple(id: string)  {

    return this.db.collection(this._coleccionBase).doc(this.usuario.idCuenta).collection<Promociones>(this.coleccion).doc(id).snapshotChanges()

  }

  /**
   * listado
   * @param args posee los argumentos para poder filtrar y paginar los registros
   * 
   * permite buscar los registros que se listaran en una tabla
   *
   */
  listado(args?: PromocionesListadoRequest) {

    return this.db
      .collection(this._coleccionBase).doc(this.usuario.idCuenta)
      .collection<Promociones>( this.coleccion, ref => {
        let query: CollectionReference | Query = ref;


        // buscar
        if (args!.buscar) {
          query = query.where('claves', 'array-contains', args!.buscar)
        }

        // filtro
        // if (args.filtro) {
        //   query = query.where('apellido', '==', args.filtro);
        // }
        
        // sorting
        if (!args!.orderBy){
          args!.orderBy = this.orden;    // orden por defecto
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


  async leeTodo() {
    return await this.db
          .collection(this._coleccionBase).doc(this.usuario.idCuenta)
          .collection<Promociones>(this.coleccion).snapshotChanges()
  }

  /**
   * 
   * =====================================================
   * Funcions de ingreso actualizacion y borrado
   * =====================================================
   */
  async actualizaDato(id:any, info: any) {
    return await this.db.collection(this._coleccionBase).doc(this.usuario.idCuenta).collection<Promociones>(this.coleccion).doc(id).update(info);
  }

  async ingresaDato(info: any) {
    return await this.db.collection(this._coleccionBase).doc(this.usuario.idCuenta).collection<Promociones>(this.coleccion).add(info);
  }
  
  async borraDato(id: string) {
    return await this.db.collection(this._coleccionBase).doc(this.usuario.idCuenta).collection<Promociones>(this.coleccion).doc(id).delete();
  }


  /**
   *  generalClaves
   * 
   * los parametros se ajustan segun las necesidades de cada base de datos
   * esta funcion permite crear claves de busqueda para multiples campos
   * 
   */
  generaClaves(semana: [], horas: []){ // se define los campos de busqueda

    var hora = Array(2);
    var info = "";
    hora = horas;
    let respuesta: any = [];

    hora[1] = (hora[1] == 0)? 24: hora[1];

    semana.forEach((dia) => {

      for(let h = hora[0]; h < hora[1]; h++ ){

        if (h >= 24) {
          info = (dia + 1 > 6)
                    ? "0-" + (h-24)
                    : (dia + 1) + "-" + (h-24)
        } else {
          info = dia + "-" + h 
        }  
        respuesta.push(info);
      }

    })

    return respuesta;

  }

}
