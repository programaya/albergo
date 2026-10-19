import { Injectable } from '@angular/core';
import { AbstractControl, ValidatorFn } from '@angular/forms';

// RXJS
import { BehaviorSubject, Subject, Observable } from 'rxjs';

// DIALOGO ATENCION
import { DipsDialogoService } from '@serv/dialogo/dips-dialog.service';
import { DipsAlertaService } from '@serv/alerta/dips-alerta.service';

// Service
import { DipsUsuarioService } from '@serv/usuario/usuario.service';
import { getStorage, ref, getDownloadURL } from 'firebase/storage';
import { ArcaService } from '@fe/services/arca.service';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { DipsDialogo } from '@serv/dialogo/dips-dialogo.component';

@Injectable({
  providedIn: 'root'
})

export class CuitService {

  // OBJETOS
  //     private datoContribuyente: BehaviorSubject<any> = new BehaviorSubject<any>("");
  private _sexoRespuesta: Subject<any> = new Subject<any>();
  private _cuitArmado: Subject<any> = new Subject<any>();

  cuentaDatos: any;
  pathCertificado: string = '';
  puntoVenta: any;

  atencionDialogoRef?: MatDialogRef<DipsDialogo>

  constructor(
    private _dipsAlertaService: DipsAlertaService,
    private _dipsDialogoService: DipsDialogoService,
    private _usuarioService: DipsUsuarioService,
    private _arcaService: ArcaService,
    private _matDialog: MatDialog,

  ) {
    // Obtener datos de cuenta
    this._usuarioService.cuenta$.subscribe((cuenta) => {
      this.cuentaDatos = cuenta;
      if (cuenta) {
        this.pathCertificado = `${this._usuarioService.coleccionCuentas}/${this.cuentaDatos.uid}/certificados/`;
        this.puntoVenta = this._usuarioService.getPuntoVentaActual;
      }
    });

  }

  // -----------------------------------------------------------------------------------------------------
  // MANEJO DE CUIT
  // -----------------------------------------------------------------------------------------------------

  async buscarEnAfip(cuit: string): Promise<void> {
    if (!cuit || cuit.length !== 11) {
      this._dipsAlertaService.danger('Debe ingresar un CUIT válido de 11 dígitos', '', 5000, true);
      return;
    }

    this._dipsAlertaService.info('Consultando Padrón...', "home", 1000);

    try {
      const certUrl = await this._obtenerUrlDescarga(this.pathCertificado + 'arca.crt');
      const keyUrl = await this._obtenerUrlDescarga(this.pathCertificado + 'arca.key');

      const credenciales = {
        certUrl: certUrl,
        keyUrl: keyUrl,
        cuit: this.cuentaDatos.fiscal.cuit,  // cuit del emisor
        puntoVenta: this.puntoVenta,
        pathCuenta: `${this._usuarioService.coleccionCuentas}/${this.cuentaDatos.uid}/`
      };


      // Preparar la solicitud de consulta
      const solicitud = {
        tipoDocumento: 80, // CUIT
        nroDocumento: parseInt(cuit, 10)
      };

      // Llamar al servicio de consulta de Padrón
      // this._arcaService.obtenerDatosFiscales(credenciales, solicitud).subscribe({
      //   next: (response: any) => {
      //     if (response.success && response.datosFiscales) {
      //       this._dipsAlertaService.info('Consulta exitosa');

      //       // Emitir los datos fiscales para que el componente padre pueda usarlos
      //       //            this.datosFiscalesRecibidos.emit(response.datosFiscales);
      //       console.log('Datos fiscales recibidos:', response.datosFiscales);

      //     } else {
      //       this._dipsAlertaService.warning(response.error || 'Contribuyente no encontrado');
      //       console.warn('Consulta no exitosa:', response);

      //       // Aún así emitir el evento para que el padre pueda tomar acción
      //       //            this.datosFiscalesRecibidos.emit(null);
      //       console.log('Datos fiscales recibidos:', response.datosFiscales);

      //     }
      //   },
      //   error: (err: any) => {
      //     // Manejo de errores específicos de AFIP
      //     const msg = err.error?.message || 'Error desconocido';
      //     const msg2 = err.error?.details.split(':') || err.error?.details;

      //     // arma mensaje
      //     this.atencionDialogoRef = this._matDialog.open(DipsDialogo, {
      //       width: '250px',
      //       enterAnimationDuration: '3000ms',
      //       exitAnimationDuration: '1500ms',

      //       data: {
      //         titulo: 'ARCA Informa',
      //         linea1: msg,
      //         linea2: msg2.length == 1 ? msg2[0] : msg2[2],
      //         linea3: msg2.length == 1 ? '' : msg2[1],
      //         btnAceptar: 'Entendido',
      //         btnCancela: '',
      //         unBoton: true
      //       }

      //     });

      //     // cuando cierra mensaje
      //     this.atencionDialogoRef.afterClosed().subscribe(respuesta => {

      //       if (!respuesta) {
      //         console.log("respuesta NO", respuesta)

      //       } else {
      //         console.log("respuesta OK", respuesta)
      //       }
      //     });

      //     // O actuar según el tipo
      //     // if (err.error?.errorCode === 'CERTIFICATE_EXPIRED') {
      //     //   this.router.navigate(['/admin/certificados']);
      //     // }
      //   }

      // });
    } catch (error: any) {
      console.error('Error al preparar la consulta:', error);
      this._dipsAlertaService.danger(error.message || 'Error al preparar la consulta', '', 5000, false);
      //    this.datosFiscalesRecibidos.emit(null);
    }
  }

  private async _obtenerUrlDescarga(ruta: string): Promise<string> {
    try {
      const storage = getStorage();
      const fileRef = ref(storage, ruta);
      const url = await getDownloadURL(fileRef);
      return url;
    } catch (error: any) {
      console.error('Error al obtener URL de descarga para la ruta:', ruta, error);

      if (error.code === 'storage/object-not-found') {
        throw new Error(`El archivo no existe en la ruta: ${ruta}`);
      } else if (error.code === 'storage/unauthorized') {
        throw new Error(`No tienes permisos para acceder al archivo: ${ruta}`);
      } else if (error.code === 'storage/unknown') {
        throw new Error(`Error desconocido al acceder al archivo: ${ruta}`);
      } else {
        throw new Error(`Error al obtener URL de descarga: ${error.message}`);
      }
    }
  }

  /** armaCUIT
   *
   * esta funcion arma el CUIT a partir de un DNI
   *
   * @param idPersona
   */
  async armaCUIT(idPersona: any): Promise<void> {
    let respuesta: any;

    idPersona = idPersona.replace(/[-\s]/g, ''); // solo dígitos

    if (idPersona.length === 11) {
      // Ya es un CUIT: validarlo antes de emitir
      const esValido = await this.cuitOk(idPersona);

      if (esValido) {
        this.setCuitArmado(idPersona);
      } else {
        this._dipsAlertaService.warning('CUIT incorrecto', '', 5000, true);
      }

    } else if (idPersona.length <= 8 && idPersona.length > 0) {
      idPersona = this._cerosIzquierda(8, idPersona);

      try {
        const genero = await this._dipsDialogoService.confirm(
          `Seleccione el Sexo del DNI ${idPersona}`,
          {
            titulo: 'Dato de Cliente',
            btnAceptar: 'Masculino',
            btnCancela: 'Femenino'
          }
        ).toPromise();

        const sexo = genero ? 'M' : 'F';
        const digito = (sexo === 'M') ? this.digitoVerificador('20' + idPersona) : this.digitoVerificador('27' + idPersona);

        if (digito === 10) {
          switch (sexo) {
            case 'M':
              respuesta = '23' + idPersona + '9';
              break;
            case 'F':
              respuesta = '23' + idPersona + '4';
              break;
          }
        } else {
          respuesta = (sexo === 'M') ? '20' + idPersona + digito : '27' + idPersona + digito;
        }

        // Validar el CUIT generado antes de emitirlo
        const esValido = await this.cuitOk(respuesta);
        if (esValido) {
          this.setCuitArmado(respuesta);
        } else {
          this._dipsAlertaService.warning('CUIT incorrecto', '', 5000, true);
        }
      } catch (error) {
        console.error('Diálogo cancelado o falló:', error);
      }
    } else {
      console.log('ERROR longitud:', idPersona.length);
      this._dipsAlertaService.warning('Longitud incorrecta de DNI o CUIT', '', 5000, true);

    }
  }

  /** cerosIzquierda
   *
   * si la longitud del DNI es menor a 8 agrega los ceros faltantes
   *
   * @param long
   * @param num
   */
  private _cerosIzquierda(long: number, num: any): any {
    return (long <= num.length) ? num : this._cerosIzquierda(long, "0" + num);
  }

  /**
 * Calcula el dígito verificador para un CUIT/CUIL argentino
 * @param cuitBase - Los primeros 10 dígitos del CUIT (sin el dígito verificador)
 *                   Puede incluir guiones o no (ej: "2012345678" o "20-12345678")
 * @returns El dígito verificador calculado (0-9)
 */
  digitoVerificador(cuitBase: string): number {
    // Limpiar guiones y espacios
    const cuitLimpio = cuitBase.replace(/[-\s]/g, '');

    // Validar que tenga exactamente 10 dígitos
    if (!/^\d{10}$/.test(cuitLimpio)) {
      throw new Error('El CUIT base debe contener exactamente 10 dígitos numéricos');
    }

    // Factores de multiplicación según AFIP (de izquierda a derecha)
    const factores = [5, 4, 3, 2, 7, 6, 5, 4, 3, 2];

    // Calcular suma ponderada
    let suma = 0;
    for (let i = 0; i < 10; i++) {
      suma += parseInt(cuitLimpio.charAt(i)) * factores[i];
    }

    // Calcular resto
    const resto = suma % 11;

    // Calcular dígito verificador
    let digitoVerificador = 11 - resto;

    // Ajustes especiales según AFIP
    if (digitoVerificador === 11) {
      digitoVerificador = 0;
    } else if (digitoVerificador === 10) {
      // Para personas físicas con prefijo 20/27, AFIP asigna DV=9 y cambia el prefijo a 23
      // Pero para el cálculo puro, devolvemos 10 para que el llamador decida el tratamiento
      digitoVerificador = 10;
    }

    return digitoVerificador;
  }

  /**
   * Valida si un CUIT/CUIL completo es válido
   * @param cuitCompleto - CUIT completo con o sin guiones (ej: "20-12345678-9" o "20123456789")
   * @returns true si es válido, false si no lo es
   */
  cuitOk(cuitCompleto: string): boolean {
    // Limpiar guiones y espacios
    const cuitLimpio = cuitCompleto.replace(/[-\s]/g, '');

    console.log('CUIT validación:', cuitLimpio);

    // Validar longitud y formato
    if (!/^\d{11}$/.test(cuitLimpio)) {
      this._dipsAlertaService.warning('CUIT incorrecto', '', 5000, true);
      return false;
    }

    // Extraer los primeros 10 dígitos y el dígito verificador
    const cuitBase = cuitLimpio.substring(0, 10);
    const digitoIngresado = parseInt(cuitLimpio.charAt(10));

    // Calcular el dígito verificador esperado
    const digitoCalculado = this.digitoVerificador(cuitBase);

    // Caso especial: DV calculado = 10
    if (digitoCalculado === 10) {
      // Para personas físicas con prefijo 20/27, AFIP usa DV=9 con prefijo 23
      const prefijo = cuitLimpio.substring(0, 2);
      if ((prefijo === '20' || prefijo === '27') && digitoIngresado === 9) {
        return true;
      }
      // Para empresas (30/33/34), DV=10 es inválido
      console.log('CUIT inválido: DV=10');

      return false;
    }

    // Comparar dígitos
    return digitoCalculado === digitoIngresado;
  }

  esCuitEmpresa(cuitCompleto: string): boolean {
    // Limpiar guiones y espacios
    const cuitLimpio = cuitCompleto.replace(/[-\s]/g, '');

    // Validar longitud y formato
    if (!/^\d{11}$/.test(cuitLimpio)) {
      return false;
    }

    // Es Empresa? (30/33/34)
    const prefijo = cuitLimpio.substring(0, 2);
    if (prefijo === '30' || prefijo === '33' || prefijo === '34') {
      return true;
    }
    return false;
  }

  /**
   * Formatea un CUIT con guiones (XX-XXXXXXXX-X)
   * @param cuit - CUIT con o sin formato
   * @returns CUIT formateado o null si es inválido
   */
  formatearCuit(cuit: string): string | null {
    const cuitLimpio = cuit.replace(/[-\s]/g, '');

    if (!/^\d{11}$/.test(cuitLimpio)) {
      return null;
    }

    return `${cuitLimpio.substring(0, 2)}-${cuitLimpio.substring(2, 10)}-${cuitLimpio.substring(10)}`;
  }

  // -----------------------------------------------------------------------------------------------------
  // @ manejo OBJETOS
  // -----------------------------------------------------------------------------------------------------

  // getAfipContribuyente(): Observable<any> {
  //     return this.datoContribuyente.asObservable();
  // }

  // setAfipContribuyente(contribuyente) {
  //     this.datoContribuyente.next(contribuyente);
  // }

  getCuitArmado(): Observable<any> {
    return this._cuitArmado.asObservable();
  }

  setCuitArmado(cuit: any) {
    this._cuitArmado.next(cuit);
  }

}
