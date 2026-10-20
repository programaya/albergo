import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

import { Usuarios } from '../../app/sesion/cuenta.model';
import { Cuentas } from '../../app/sesion/cuenta.model';

@Injectable({
  providedIn: 'root'
})
export class DipsUsuarioService {

  private usuario: BehaviorSubject<Usuarios>;
  private cuenta: BehaviorSubject<Cuentas>;

  // ✅ NUEVAS propiedades públicas (compatibles con Angular 19)
  public usuario$!: Observable<Usuarios>;
  public cuenta$!: Observable<Cuentas>;

  public dialogoAbierto: boolean = false;
  public login: boolean = false;
  public sesion: any;

  constructor() {

    this.usuario = new BehaviorSubject<Usuarios>(new Usuarios);
    this.cuenta = new BehaviorSubject<Cuentas>(new Cuentas);

  }

  getUsuario(): Observable<Usuarios> {
    return this.usuario.asObservable();
  }

  getCuenta(): Observable<Cuentas> {
    return this.cuenta.asObservable();
  }

  setUsuario(nuevoUsuario: any): void {
    this.usuario.next(nuevoUsuario);
  }

  setCuenta(nuevaCuenta: any): void {
    this.cuenta.next(nuevaCuenta);
  }

}
