import { Injectable } from '@angular/core';
import { AngularFirestore, CollectionReference, Query } from '@angular/fire/compat/firestore';

import { Movimientos, MovimientosListadoRequest, MovimientosListadoItem } from './movimientos.model';
import { DipsUtils } from '../../../../@dips/utils';

import { DipsUsuarioService } from 'src/@dips/services/usuario.service';
import { Subject } from 'rxjs';
import { takeUntil, take } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class MovimientosDatabase {

  // Datos Generales MODIFICAR
  coleccion: any = 'movimientos';  // poner la coleccion y el nombre correspondiente
  orden: any = 'nombre';

  busca: any = '';

  // Usuario 
  private usuario: any;  

  /**
   * La Database traslada los requerimientos de Datasource a el backend.
   */
  constructor(
      private db: AngularFirestore,
      private _dipsUsuarioService: DipsUsuarioService,
      ) {

        // Usuario 
        this._dipsUsuarioService.getUsuario()
              .subscribe((usuario) => {

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
  simple(id: string)  {

    return this.db.collection('cuentas').doc(this.usuario.idCuenta).collection<Movimientos>(this.coleccion).doc(id).snapshotChanges()

  }

  /**
   * listado
   * @param args posee los argumentos para poder filtrar y paginar los registros
   * 
   * permite buscar los registros que se listaran en una tabla
   *
   */
  listado(args?: MovimientosListadoRequest) {

      return this.db
        .collection('cuentas').doc(this.usuario.idCuenta)
        .collection<Movimientos>( this.coleccion, ref => {
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
//          query = query.limit(args!.limit || args!.pageSize);

        }

        return query;
      })
      .snapshotChanges();    

  }

  async leeTodo() {
    return await this.db
          .collection('cuentas').doc(this.usuario.idCuenta)
          .collection<Movimientos>(this.coleccion).snapshotChanges()
 
  }
  
  /**
   * 
   * =====================================================
   * Funcions de ingreso actualizacion y borrado
   * =====================================================
   */
  async actualizaDato(id:any, info: any) {
    return await this.db.collection('cuentas').doc(this.usuario.idCuenta).collection<Movimientos>(this.coleccion).doc(id).update(info);
  }

  async ingresaDato(info: any) {
    return await this.db.collection('cuentas').doc(this.usuario.idCuenta).collection<Movimientos>(this.coleccion).add(info);
  }
  
  async borraDato(id: string) {
    return await this.db.collection('cuentas').doc(this.usuario.idCuenta).collection<Movimientos>(this.coleccion).doc(id).delete();
  }

  // -----------------------------------------------------------------------------------------------------
  //  funciones de Busqueda
  // -----------------------------------------------------------------------------------------------------

  /**
   * buscaxNombre
   * @param nombre 
   * 
   * busca ya sea por el SKU o por el codigo de barras
   */
  buscaxNombre(nombre: string) {

      return this.db
            .collection('cuentas').doc(this.usuario.idCuenta)
            .collection<Movimientos>( this.coleccion, ref => {

              let query: CollectionReference | Query = ref;
              query = query.where('nombre', "==", nombre)

              return query;
      })
      .snapshotChanges().pipe(take(1));
  
  }
  
}
