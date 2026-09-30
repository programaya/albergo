import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Usuarios } from  './usuarios';
import { Observable } from  'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UsuariosService {

  PHP_SERVER = "http://esqueleto.programaya.com";
  
  constructor(private httpClient: HttpClient) { }

  escribe() {
    console.log("antes de PHP");
    console.log(sessionStorage.getItem("clave"))
    return this.httpClient.get(`${this.PHP_SERVER}/prueba.php/?key=${sessionStorage.getItem("clave")}`);
  }

  leeUsuarios(): Observable<Usuarios[]>{
    return this.httpClient.get<Usuarios[]>(`${this.PHP_SERVER}/usuarios/usulee.php`);
  }

  cambiaUsuarios(usuario: Usuarios){
    return this.httpClient.put<Usuarios>(`${this.PHP_SERVER}/usuarios/usumod.php`, usuario);   
  }

  borraUsuarios(id: number){
    return this.httpClient.delete<Usuarios>(`${this.PHP_SERVER}/usuarios/usubor.php/?id=${id}`);
  }
  
}