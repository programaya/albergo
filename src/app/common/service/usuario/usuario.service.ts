import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

import { Usuarios, Cuentas } from '@dbTabla/cuenta.model'
import { environment } from '@base/src/environments/environment';
import { doc, Firestore, onSnapshot, updateDoc } from '@angular/fire/firestore';

// DiPS
import { DipsUtils } from '@comun/utils'

@Injectable({
  providedIn: 'root'
})
export class DipsUsuarioService {

  // Usuario id
  private _usuarioUID = new BehaviorSubject<string>('')
  public usuarioUID$ = this._usuarioUID.asObservable();

  // Usuario
  private _usuario = new BehaviorSubject<Usuarios>(new Usuarios)
  public usuario$ = this._usuario.asObservable();

  // Cuenta
  private _cuenta = new BehaviorSubject<Cuentas>(new Cuentas)
  public cuenta$ = this._cuenta.asObservable();

  // Punto de Venta
  private _puntoVenta = new BehaviorSubject<any>(null);
  public puntoVenta$ = this._puntoVenta.asObservable();

  public dialogoAbierto: boolean = false;
  public login: boolean = false;
  public sesion: any;

  public coleccionUsuarios: any
  public coleccionCuentas: any

  // Tutorial
  public tutorialInicial: boolean = false;




  constructor(
    private _db: Firestore,
  ) {

    // enviroment de prueba o produccion
    if (environment.production) {
      this.coleccionUsuarios = 'usuarios'
      this.coleccionCuentas = 'cuentas'

    } else {
      this.coleccionUsuarios = 'zTest-usuarios'
      this.coleccionCuentas = 'zTest-cuentas'
    }

    // Suscribirse a cambios en usuario y cuenta para recalcular punto de venta
    this._usuario.subscribe(() => this.actualizarPuntoVenta());
    this._cuenta.subscribe(() => this.actualizarPuntoVenta());
  }

  // USUARIOS ===================================
  setUsuarioUID(nuevoUsuario: any): void {
    this._usuarioUID.next(nuevoUsuario);
  }

  setUsuario(nuevoUsuario: Partial<Usuarios>): void {
    const usuarioActual = this._usuario.getValue();
    const usuarioActualizado = { ...usuarioActual, ...nuevoUsuario };
    this._usuario.next(usuarioActualizado);
  }

  get getUsuario(): Usuarios {
    return this._usuario.getValue();
  }

  async salvaUsuario(nuevoUsuario: Partial<Usuarios>): Promise<void> {
    const usuarioActual = this._usuario.getValue();

    // 1. Fusionar con el estado actual
    this.setUsuario(nuevoUsuario);

    console.log("salvaUsuario", usuarioActual.uid)

    // 2. actualizar en Firestore SOLO los campos modificados
    try {
      //const cuentaRef = doc(this._db, this.coleccionUsuarios, this._usuario.getValue().uid!);
      await updateDoc(doc(this._db, this.coleccionUsuarios, usuarioActual.uid!), nuevoUsuario);
      console.log('✅ Usuario actualizado en Firestore:', nuevoUsuario);

    } catch (error) {
      console.error('❌ Error actualizando Usuario en Firestore:', error);

    }

  }

  // CUENTAS =====================================
  setCuenta(nuevaCuenta: Partial<Cuentas>): void {
    // 1. Fusionar con el estado actual
    const cuentaActual = this._cuenta.getValue();
    const cuentaActualizada = { ...cuentaActual, ...nuevaCuenta };

    // 2. Guardar en el BehaviorSubject
    this._cuenta.next(cuentaActualizada);
  }

  get getCuenta(): Cuentas {
    return this._cuenta.getValue();
  }

  async salvaCuenta(nuevaCuenta: Partial<Cuentas>): Promise<void> {
    const cuentaActual = this._cuenta.getValue();

    // Actualizar en Firestore SOLO los campos modificados
    try {
      const cuentaRef = doc(this._db, this.coleccionCuentas, cuentaActual.uid!);
      await updateDoc(cuentaRef, nuevaCuenta);
      console.log('✅ Cuenta actualizada en Firestore:', nuevaCuenta);

    } catch (error) {
      console.error('❌ Error actualizando cuenta en Firestore:', error);

    }

  }

  // PUNTOS de VENTAS =====================================
  // Método para calcular y actualizar el punto de venta actual
  private actualizarPuntoVenta(): void {
    const usuario = this._usuario.getValue();
    const cuenta = this._cuenta.getValue();

    const sucursalActiva = cuenta.sucursales?.find(s => s.nombre === usuario.sucursal);
    const puntoVenta = sucursalActiva ? sucursalActiva.puntoVenta : 1;

    this._puntoVenta.next(puntoVenta);
  }

  // Getter público para acceso directo
  get getPuntoVentaActual(): number {
    return this._puntoVenta.getValue();
  }

  async actualizarVencimientoFE(nuevoVencimiento: string): Promise<void> {
    const cuentaActual = this._cuenta.getValue();

    if (!cuentaActual.uid) {
      console.error('❌ UID no disponible para actualizar cuenta');
      return;
    }

    try {
      const cuentaRef = doc(this._db, this.coleccionCuentas, cuentaActual.uid);

      // Actualiza SOLO el campo fiscal.vencimientoFE
      await updateDoc(cuentaRef, {
        'fiscal.vencimientoFE': nuevoVencimiento
      });

      console.log('✅ vencimientoFE actualizado en Firestore:', nuevoVencimiento);

      // Opcional: también actualiza el estado local
      this.setCuenta({
        fiscal: {
          ...cuentaActual.fiscal,
          vencimientoFE: nuevoVencimiento
        }
      });

    } catch (error) {
      console.error('❌ Error actualizando vencimientoFE en Firestore:', error);
    }
  }


}
