import { Injectable } from '@angular/core';
import { DataSourceItem, ReactiveDataSource } from '@matheo/datasource';
import { get } from 'lodash';
import { of } from 'rxjs';
import { map } from 'rxjs/operators';
import { UsuariosDatabase } from './usuarios.database';
import { Usuarios, UsuariosListadoRequest, UsuariosListadoItem } from '../../../sesion/cuenta.model';
import { docsMapper } from '../..';

@Injectable()
export class UsuariosDatasource extends ReactiveDataSource<UsuariosListadoRequest, UsuariosListadoItem[], Usuarios> {
  currentPage!: any;
  first!: UsuariosListadoItem | null;
  last!: UsuariosListadoItem | null;

  constructor(protected database: UsuariosDatabase) {
    super();

    this.config = {
      debug: true,
      autoStart: true,
      emptyMsg: () => {

        if ( this.args.buscar ){    // Mensaje para busqueda
          return ' No datos localizados para la Busqueda';
        }

        return 'No hay información';    // Mensaje general
      }
    };
    this.pageSize = 25;     // longitud standard de listado
  }

  reqArguments(args: UsuariosListadoRequest) {
    // we cannot sortBy() with an equality filter on the same field
    // if (args.orderBy === 'tier') {
    //   args.tier = undefined;
    // }

    // somehow the paginator is not updating the pageSize initially
    if (!args.pageSize) {
      args.pageSize = this.pageSize;
    }

    if (args.pageIndex) {
      if (args.pageIndex === this.currentPage) {
        args.startAt = [this.first];
      } else if (args.pageIndex > this.currentPage) {
        args.startAfter = [this.last];
      } else {
        // inverse the order to be able to use startAt()
        args.orderDir = args.orderBy === 'desc' ? 'asc' : 'desc';
        args.startAfter = [this.first];
      }
    } else {
      this.currentPage = 0;
      this.first = null;
      this.last = null;
    }

    return args;
  }

  rawDefault() {
    return [];
  }

  rawFetch(args: UsuariosListadoRequest) {
    return this.database.listado(args);
  }

  rawTotal(result: UsuariosListadoItem[]) {
    // we handle everything here because we have no guarantee
    // that the call fetch call gets canceled by another trigger

    const args = this.args;

    if (!args.pageSize) {
      // direct total if not handling pagination
      return of(result.length);
    }

    const isPrevious = args.pageIndex! < this.currentPage;

    // reverse the order
    result = isPrevious ? result.reverse() : result;

    const total = isPrevious ? this.total : args.pageIndex! * args.pageSize + result.length;

       // update the pagination controls
    this.currentPage = args.pageIndex;
    // this.first = get(result[0], 'payload.doc');
    // this.last = get(result[result.length - 1], 'payload.doc');

    if (isPrevious) {
      // restore the order
      this.arguments.orderDir = args.orderDir === 'desc' ? 'asc' : 'desc';
      return of(this.total);

    } else if (result.length < args.pageSize) {
      this.last = null;
     return of(total);
    }

    // check if there's a next
    return this.database
      .listado({
        ...args,
        startAfter: [this.last],
        pageIndex: args.pageIndex! + 1,
        limit: 1
      })
      .pipe(map(res => total + res.length));

}

  rawResult(result: UsuariosListadoItem[]): Usuarios[] {
    return docsMapper(result);
  }

  filter(query: string, limit: number): void {
    throw new Error('Method not implemented.');
  }

  resFilter(result: Usuarios[]): DataSourceItem[] {
    throw new Error('Method not implemented.');
  }
}
