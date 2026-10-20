// src/@dips/services/usuario.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Usuarios } from '../../../../sesion/cuenta.model'
import { Cuentas } from '../../../../sesion/cuenta.model';

@Injectable({
    providedIn: 'root'
})
export class DipsUsuarioService {
    private usuario: BehaviorSubject<Usuarios>;
    private cuenta: BehaviorSubject<Cuentas>;
    private _puntoVenta = new BehaviorSubject<number>(1); // ✅ NUEVO

    // ✅ Propiedades públicas (compatibles con Angular 19)
    public usuario$!: Observable<Usuarios>;
    public cuenta$!: Observable<Cuentas>;
    public puntoVenta$!: Observable<number>; // ✅ NUEVO

    public dialogoAbierto: boolean = false;
    public login: boolean = false;
    public sesion: any;

    constructor() {
        this.usuario = new BehaviorSubject<Usuarios>(new Usuarios);
        this.cuenta = new BehaviorSubject<Cuentas>(new Cuentas);

        // ✅ Exponer los Observables como propiedades públicas
        this.usuario$ = this.usuario.asObservable();
        this.cuenta$ = this.cuenta.asObservable();
        this.puntoVenta$ = this._puntoVenta.asObservable(); // ✅ NUEVO

    }

    getUsuario(): Observable<Usuarios> {
        return this.usuario.asObservable();
    }

    getCuenta(): Observable<Cuentas> {
        return this.cuenta.asObservable();
    }

    setUsuario(nuevoUsuario: any): void {
        const usuarioActual = this.usuario.getValue();
        const usuarioActualizado = { ...usuarioActual, ...nuevoUsuario };
        this.usuario.next(usuarioActualizado);
    }

    setCuenta(nuevaCuenta: any): void {
        const cuentaActual = this.cuenta.getValue();
        const cuentaActualizada = { ...cuentaActual, ...nuevaCuenta };
        this.cuenta.next(cuentaActualizada);
    }

}