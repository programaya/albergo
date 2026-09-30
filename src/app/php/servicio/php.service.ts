import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class PHPService {

  myURL: string | undefined;

  // ATENCION MODIFICAR
//  PHP_SERVER = "http://localhost:8001"  
  PHP_SERVER = "https://gessi.programaya.com";

  public token: any;
  public leeTokenFlag: boolean = false;   // no se lee el token si este flag esta activo

  public impcomando:any;
  public impdato:any;
  
  constructor(
        private httpClient: HttpClient,
//        private httpHeaders: HttpHeaders
      ) { }


  getPHPToken(usuario: any, cuenta: any) {
    return this.httpClient.get(`${this.PHP_SERVER}?p=autentica&u=${usuario}&c=${cuenta}`);
  }

  ejecutaPHP(comando: any, dato: any){
    console.log(`${this.PHP_SERVER}?p=tarea&x=${comando}&d=${dato}&t=${this.token}`)

    return this.httpClient.get(`${this.PHP_SERVER}?p=tarea&x=${comando}&d=${dato}&t=${this.token}`)
  }

  imprimePDF(comando: any, dato: any, fijo?: any){

    // esta variable recibira la seleccion del cliente con respecto a que grupo de diseño
    var grupoPlantilla = 'prueba'

    let url = `${this.PHP_SERVER}`
    let info = JSON.stringify({ 
                  p: "info",            // Pagina a procesar (es el tipo de impresion)
                  x: comando,           // ttt.mmm.fff => ttt = trabajo, mmm = modulo, fff = funcion
                  t: this.token,        // Token
                  g: grupoPlantilla,    // Grupo para Plantillas
                  f: fijo,              // Datos Fijos
                  d: dato},             // Datos a Imprimir
                  );

    console.log('INFORMCION DE IMPRESION')
    console.log(info);  

    let headers = new HttpHeaders();
    headers = headers.set('Content-Type', 'application/pdf');
    return this.httpClient.post(url, info, { headers: headers, responseType: 'blob' as 'json' });

  }
 

  /** afipPersona

      trae los datos de la persona a partir del cuit
   */
  afipPersona(comando: any, fijo: any){

    let url = `${this.PHP_SERVER}`
    let info = JSON.stringify({ 
                  p: "comandoAfip",   // pagina
                  x: comando,
                  t: this.token,
                  c: "20164480896",  // PONER VARIABLE CON EL CUIT DE LA EMPRESA A LA QUE SE REPRESENTA
                  f: fijo},
                  );

    let headers = new HttpHeaders();
    headers = headers.set('Content-Type', 'application/json');
    return this.httpClient.post(url, info, { headers: headers, responseType: 'text' });
   

  }
  
}