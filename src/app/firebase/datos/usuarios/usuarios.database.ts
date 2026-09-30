import { Injectable } from '@angular/core';
import { AngularFirestore, CollectionReference, Query } from '@angular/fire/compat/firestore';

import { Usuarios, UsuariosListadoRequest, UsuariosListadoItem } from '../../../sesion/cuenta.model';
import { DipsUsuarioService } from 'src/@dips/services/usuario.service';
import { environment } from 'src/environments/environment';


@Injectable({
  providedIn: 'root'
})
export class UsuariosDatabase {

  // Datos Generales MODIFICAR
  coleccion: any = 'usuarios';  // poner la coleccion y el nombre correspondiente
  orden: any = 'nombre';

  // Usuario 
  private usuario: any;     
  
  /**
   * La Database traslada los requerimientos de Datasource a el backend.
   */
  constructor(
        private db: AngularFirestore,
        private _dipsUsuarioService: DipsUsuarioService
        ) {

            // enviroment de prueba o produccion
            if (environment.production) {
              this.coleccion = 'usuarios'  

            } else {
              this.coleccion = 'zTest-usuarios'
            }
          
            // Usuario 
            this._dipsUsuarioService.getUsuario().subscribe((usuario: any) => {
              this.usuario = usuario;

              console.log("en SUSCRIBE")
              console.log(this.usuario)

            })
  
  }

  /**
   * simple
   * @param id 
   * 
   * busca un determinado documento segun su identificacion
   */
  simple(id: string)  {

    return this.db.collection<Usuarios>(this.coleccion).doc(id).snapshotChanges()

  }

  /**
   * listado
   * @param args posee los argumentos para poder filtrar y paginar los registros
   * 
   * permite buscar los registros que se listaran en una tabla
   *
   */
  listado(args?: UsuariosListadoRequest) {

    return this.db
      .collection<Usuarios>( this.coleccion, ref => {
        let query: CollectionReference | Query = ref;

        query = query.where('idCuenta', '==', this.usuario.idCuenta);


        // buscar
        if (args!.buscar) {
          query = query.where('claves', 'array-contains', args!.buscar)
        }

        // filtro
        if (args!.filtro) {
          query = query.where('apellido', '==', args!.filtro);
        }
        
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

  /**
   * 
   * =====================================================
   * Funcions de ingreso actualizacion y borrado
   * =====================================================
   */
  async actualizaDato(id:any, info: any) {
    return await this.db.collection<Usuarios>(this.coleccion).doc(id).update(info);
  }

  async ingresaDato(info: any) {
    return await this.db.collection<Usuarios>(this.coleccion).add(info);
  }
  
  async borraDato(id: string) {
    return await this.db.collection<Usuarios>(this.coleccion).doc(id).delete();
  }

}
