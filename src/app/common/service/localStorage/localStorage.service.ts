import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import * as CryptoJS from 'crypto-js';
import { isPlatformBrowser } from '@angular/common';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class StorageService {
  // Clave de encriptación (debería estar protegida, no expuesta públicamente)
  private _encryptionKey = 'DiPS-1193';

  /**
  * Notificacion
  */
  private _changeSubject = new Subject<void>();
  cambio$ = this._changeSubject.asObservable();

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  // ================================================================
  // Procesos de LocalStorage
  // ================================================================

  /**
   * Guarda un valor en localStorage, encriptado
   */
  setItem(key: string, value: any): void {
    if (!isPlatformBrowser(this.platformId)) return;

    const encryptedValue = this._encrypt(JSON.stringify(value));
    localStorage.setItem(key, encryptedValue);

    this._notificarCambio()
  }

  /**
   * Obtiene un valor desde localStorage y lo desencripta
   */
  getItem<T>(key: string): T | null {
    if (!isPlatformBrowser(this.platformId)) return null;

    const encryptedValue = localStorage.getItem(key);
    if (!encryptedValue) return null;

    try {
      const decryptedValue = this._decrypt(encryptedValue);
      return JSON.parse(decryptedValue);
    } catch (e) {
      console.error('Error al desencriptar o parsear el dato:', e);
      return null;
    }
    
  }

  
  /**
   * Actualiza solo 1 campo
   * @param key 
   * @param field 
   * @param value 
   */
  updateField<T>(key: string, field: keyof T, value: any): void {
    if (!isPlatformBrowser(this.platformId)) return 

    const item = this.getItem<T>(key);
    if (item) {
      item[field] = value;
      this.setItem(key, item);
    }
  }

  /**
   * Elimina un valor del localStorage
   */
  removeItem(key: string): void {
    if (!isPlatformBrowser(this.platformId)) return;

    localStorage.removeItem(key);
  }

  /**
   * Limpia todo el localStorage
   */
  clear(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    localStorage.clear();
  }

  /**
   * Notifica que un cambio se ha producido
   * y por ende se debe sicronizar
   */
  private _notificarCambio() {
    this._changeSubject.next();
  }

  // ================================================================
  // Encriptacion
  // ================================================================

  /**
   * Encripta una cadena usando AES
   */
  private _encrypt(data: string): string {
    return CryptoJS.AES.encrypt(data, this._encryptionKey).toString();
  }

  /**
   * Desencripta una cadena usando AES
   */
  private _decrypt(cipherText: string): string {
    const bytes = CryptoJS.AES.decrypt(cipherText, this._encryptionKey);
    return bytes.toString(CryptoJS.enc.Utf8);
  }
}

export interface Local {

    device:   string
    sucursal: string
    sesion:   string
    usuario:  string
    email:    string
    foto:     string
    
}

           /**
                 * local = {
                    device:         DEVICE USADO 
                    sucursal:       SUCURSAL EMPRESA
                    sesion:         SESIONES ANTERIORES
                    usuario: ''     USUARIO ANTERIOR
                    email: ''       EMAIL ANTERIOR
                  }  
                 */