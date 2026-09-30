import { Injectable, OnDestroy } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

// RXJS
import { take, takeUntil } from 'rxjs/operators';
import { BehaviorSubject, Observable, Subject, of } from 'rxjs';

import { environment } from 'src/environments/environment';
import { DipsUsuarioService } from 'src/@dips/services/usuario.service';

@Injectable({
  providedIn: 'root'
})
export class NodeJsService implements OnDestroy {

  NODE_SERVER = "https://albergo.programaya.com/app";

  // Paginacion
  length = 25
  pageSize = 10
  pageIndex = 0
  pageSizeOptions = [5, 10, 25]

  datosTabla = new Subject()

  private ensayo: any;
  private _unsubscribeAll: Subject<any>;
  private _usuario: any


  constructor(
        private httpClient: HttpClient,
        private _dipsUsuarioService: DipsUsuarioService

      ) {

    // enviroment de prueba o produccion
    if (environment.production) {
      this.ensayo = 'prod'  

    } else {
      this.ensayo = 'dev'
    }

    this._unsubscribeAll = new Subject();

    this._dipsUsuarioService.getUsuario()
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((usuario: any) => {
                this._usuario = usuario;
            })
        
  }

  ngOnDestroy(): void {
    this._unsubscribeAll.next();
    this._unsubscribeAll.complete();
  }

  async crud(comando: any, archivo: any, dato: any){

    let url = `${this.NODE_SERVER}/${this.ensayo}/${archivo}`
    let info = JSON.stringify(dato);

                  console.log("NODEJS CRUD " + comando, url, info)

    let headers = new HttpHeaders();
    headers = headers.set('Content-Type', 'application/json');

    if (comando == "post") {
      this.httpClient.post(url, info, { headers: headers, responseType: 'text' })
                      .pipe(takeUntil(this._unsubscribeAll))
                      .subscribe( 
                        dato => { 
                          console.log("PHP respuesta crud " + comando, dato) 
                        })
    }                    
  }

  //getRegistros(cuenta: string, pageSize: number, pageIndex:number): Observable<any> {
  getRegistros(cuenta: string): Observable<any> {

    let url = `${this.NODE_SERVER}/${this.ensayo}/reg`

    let queryParameters = `?cuenta=${cuenta}&pageSize=${this.pageSize}&pageIndex=${this.pageIndex}`
    let headers = new HttpHeaders();
    headers = headers.set('Content-Type', 'application/json');

    // this.httpClient.get(url, { headers: headers})
    //                 .pipe((datosReg: any) => {
    //                   })

    return this.httpClient.get(url + queryParameters, {"headers": headers})
  }

  // listado(comando: any, id: string = "") {

  //   let dato = ''
  //   const random = Math.floor(Math.random() * 100)

  //   if (comando == 'monitor') {
  //     dato = this._usuario.idCuenta

  //   } else {

  //     if (id != "") {
  //       dato = id
  //     }

  //   }
    
  //   console.log("LISTADO PHP", `${this.PHP_SERVER}?p=listado&c=${comando}&e=${this.ensayo}&d=${dato}&r=${random}`)
    
  //   return this.httpClient.get(`${this.PHP_SERVER}?p=listado&c=${comando}&e=${this.ensayo}&d=${dato}&r=${random}`)

  // }

  leeRegistros(idCuenta: any) {

    this.getRegistros(idCuenta)
      .pipe(take(1))
      .subscribe(resp => { 
              console.log("DATOS NODEJS", resp)
              console.log("array", resp.datos)
              console.log("total", resp.total)

              this.length = resp.total
              this.datosTabla.next(resp.datos)
        }   
      )
  }         

}