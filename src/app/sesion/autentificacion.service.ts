import { provideFirebaseApp } from '@angular/fire/app';
import { Injectable } from '@angular/core';

import { AngularFireAuth } from '@angular/fire/compat/auth';
//?import { auth } from 'firebase/app';
import firebase from '@firebase/app-compat';

import { AngularFirestore, CollectionReference, Query } from '@angular/fire/compat/firestore';

import { DipsUtils } from '../../@dips/utils';
import { Timestamp } from '@firebase/firestore-types'; 

// RXJS
import { Observable } from 'rxjs';
import { take } from 'rxjs/operators'

// rutas
import { Router } from '@angular/router';

// modelos
import { Cuentas, UsuariosListadoRequest } from './cuenta.model';     
import { Usuarios } from './cuenta.model';

import { DipsUsuarioService } from 'src/@dips/services/usuario.service';
import { PHPService } from 'docs/elimina/php/servicio/php.service';

// Parametros
import { DipsParametroService } from 'src/@dips/services/parametro/parametro.service';
import { environment } from 'src/environments/environment';

// import { MatTreeFlatDataSource } from '@angular/material';
// import { connectableObservableDescriptor } from 'rxjs/internal/observable/ConnectableObservable';

@Injectable({
  providedIn: 'root'
})
export class AutentificacionService {

  errorAuth: String = "";     // Retorna el error
  confirmaEmail: String = ""; // es para enlazar la confirmacion de email.

  userDato :   Observable<firebase.default.User | null>;  
  //userDato: Observable<any>
  userDetalle: any = null;

  // Datos Generales MODIFICAR
  coleccionUsuarios: any  // poner la coleccion 
  coleccionCuentas: any
  
  conexionRef: any;

  constructor(
      public _router: Router,
      private _afsAuth: AngularFireAuth, 
 //     private _auth: Auth,
      private db: AngularFirestore,
 //     private _dbFS: Firestore,
      private _dipsUsuarioService: DipsUsuarioService,
      private _parametrosService: DipsParametroService,
      private _phpService: PHPService
      ) 
  {

    // enviroment de prueba o produccion
    if (environment.production) {
      this.coleccionUsuarios = 'usuarios'  
      this.coleccionCuentas  = 'cuentas'  

    } else {
      this.coleccionUsuarios = 'zTest-usuarios'
      this.coleccionCuentas  = 'zTest-cuentas'  
    }



    this.userDato = _afsAuth.authState;     //Estado actual de autentificacion
//    this.userDato = user(this._auth)

    // Actualiza los datos del actual usuario
    this.userDato.subscribe(
        (dato) => {

          let usuario: any | null = dato

          if (usuario != null) {
            if (usuario) {
              if (usuario.emailVerified ) {
                this.userDetalle = dato;

              } else {
                this.userDetalle = null;
              }
            } else {
              this.userDetalle = null;
            }
          }
        }
      )  
  }


  // -----------------------------------------------------------------------------------------------------
  // @ Autentificacion con Servicios
  // -----------------------------------------------------------------------------------------------------

  /**
   *  inicioConFacebook
   */
  // async inicioConFacebook(){

  //   // const proveedor = new FacebookAuthProvider();

  //   // this.inicioConServicio(proveedor);
   
  // }

  /**
   *  inicioConGoogle
   */
//   async inicioConGoogle(){

// //?    await this._afsAuth.setPersistence(auth.Auth.Persistence.SESSION)
//   //  await this._afsAuth.setPersistence(firebase.auth.Auth.Persistence.SESSION)
//     await this._afsAuth.setPersistence('session')

//     const proveedor = new firebase.auth.GoogleAuthProvider();

//     //const proveedor = new GoogleAuthProvider();

//     this.inicioConServicio(proveedor);

//   }

  async inicioConServicio(proveedor: any){

    const usuario = await this._afsAuth.signInWithPopup(proveedor);
    await this.actualizaUsuario(usuario.user, usuario.additionalUserInfo?.isNewUser); // actualiza el usuario

//    const usuario = await signInWithPopup(this._auth, proveedor)
    // const additionalInfo = getAdditionalUserInfo(usuario);

    // await this.actualizaUsuario(usuario.user, additionalInfo?.isNewUser)    // actualiza el usuario

    this._router.navigate(['principal/inicio']);
  }

  // -----------------------------------------------------------------------------------------------------
  // @ Autentificacion con email 
  // -----------------------------------------------------------------------------------------------------

  /**
   * registroConMail
   * 
   */
  async registroConMail(email: any, pass: any, nombre: any): Promise<void> {

    this.errorAuth = '';

    try {

      await this._afsAuth.createUserWithEmailAndPassword(email, pass);

      // procesos cuando no hay error
      const usuario = await this.userActual(); // actual usuario

      await usuario?.updateProfile({   // Se actualiza el nombre
            displayName: nombre
      });

      usuario?.sendEmailVerification();
      
      await this.actualizaUsuario(usuario, true); // actualiza el usuario


      // const credential = await createUserWithEmailAndPassword(
      //       this._auth,
      //       email,
      //       pass
      // );

      // await updateProfile(
      //   credential.user, { displayName: nombre }
      // );

      // await sendEmailVerification(credential.user);
        
      // await this.actualizaUsuario(credential, true); // actualiza el usuario

    } catch (e: any){

      this.errorAuth = e.code

    }

  }
 
  /**
   * inicioConMail
   * 
   */
  async inicioConMail(email: any, pass: any, recuerdo: any): Promise<any> {

    this.errorAuth = '';

    try {

      //await this._afsAuth.setPersistence(firebase.auth.Auth.Persistence.SESSION)
      await this._afsAuth.setPersistence('session')

      const usuario = await this._afsAuth.signInWithEmailAndPassword(email,pass);

 //?     await this._afsAuth.setPersistence(auth.Auth.Persistence.SESSION)

 //     const usuario = await signInWithEmailAndPassword(this._auth, email, pass);

      if (usuario.user?.emailVerified) {
        this.errorAuth = '';
        this.userAutentificado();

        await this.actualizaUsuario(usuario.user, false); // actualiza el usuario
        
      } else {
        this.errorAuth = 'no-Confirmado'
      }

    } catch (e: any) {
      this.errorAuth = e.code;
    } 
  }

  /**
   *  resetPassword
   * 
   * Recuperar contraseña
   * Envia un mail para reset la clave
   * 
   */
  async resetPassword(email: any) {

    this.errorAuth = '';

    try {
      await this._afsAuth.sendPasswordResetEmail(email);
//      await sendPasswordResetEmail(this._auth, email)

    } catch (e: any) {
      this.errorAuth = e.code;

    } 
  }

  // -----------------------------------------------------------------------------------------------------
  // @ Manejo e informacion de Usuario
  // -----------------------------------------------------------------------------------------------------

  /**
   * actualUsuario
   * devuelve los datos del usuario actual
   */
   async userActual() {

    return await this._afsAuth.currentUser

  } 

  /**
   * userAutentificado
   *
   * @type {boolean}
   * 
   * informa verdadero o falso si el usuario esta auteficado
   */
  async userAutentificado() {

    return this.userDato !== null;
    // if (this.userDetalle !== null) {
    //   if (this.userDetalle.emailVerified) {
    //     return true;
    //   }
    // }

    // return false;
  }

  /**
   * userFinSesion
   */
  async userFinSesion(){

    await this._afsAuth.signOut();
    this._phpService.token = undefined;
    this._dipsUsuarioService.sesion = undefined;
    this._router.navigate(['sesion/login']);
  }


  // -----------------------------------------------------------------------------------------------------
  // @ Manejo e informacion de CUENTAS y USUARIOS
  // -----------------------------------------------------------------------------------------------------

  /**
   * actualizaUsuario
   * 
   * Graba los datos del usuario en la cuenta durante el login
   * 
   */
  async actualizaUsuario(user: any, nuevo: any) {

    this._dipsUsuarioService.login = true;

    const usuarioRef = await this.db.collection<Usuarios>(this.coleccionUsuarios).doc('/' + user.uid)
  
    const datos: Usuarios = {
      uid:                user.uid,
      nombre:             user.displayName,
      email:              user.email,
      busqueda:           this.generaClaves(user.displayName, user.email),
      telefono:           user.phoneNumber,
      foto:               user.photoURL,
      fechaCreacion:      user.metadata.creationTime,
      fechaUltimoIngreso: user.metadata.lastSignInTime,
      sesion:             DipsUtils.generateGUID(),
      onLine:             true,
    }

    if (nuevo) {    // Si es un usuario nuevo

      datos.tipoAdmin   = true;
      datos.tipoEncargado = false;
      datos.idCuenta    = datos.uid;
      datos.emailCuenta = datos.email;
      datos.estado = 'Activo';
      datos.fechaVencimiento = this.sumarDias(new Date(user.metadata.creationTime), 30)
    }

    await usuarioRef.set(datos, { merge: true });

    if (nuevo) {
      await this.actualizaCuenta(datos, nuevo)
    }

    this._dipsUsuarioService.sesion = datos.sesion;

    return true;

  }


  /**
   * actualizaCuenta
   * 
   */
  async actualizaCuenta(cuenta: any, nuevo: any) {

    const cuentaRef = await this.db.collection<Cuentas>(this.coleccionCuentas).doc('/' + cuenta.uid)

    const datos: Cuentas = {
      uid:      cuenta.uid,
      email:    cuenta.email,
      nombre:   cuenta.nombre,
      busqueda: this.generaClaves(cuenta.nombre, cuenta.email),
      foto:     cuenta.foto,
    }

    if (nuevo) {    // Si es un usuario nuevo
      datos.comparteCuenta = false;
      datos.email = cuenta.email;
      datos.nombre = '';
      datos.eslogan = '';
      datos.foto = '';
      datos.fechaCreacion = cuenta.fechaCreacion;
    }

    //await setDoc(cuentaRef, datos)
    await cuentaRef.set(datos, { merge: true });

    // Si la cuenta es nueva tambien se inicializa los parametros para el esp
    if (nuevo) {

      this._parametrosService.inicializa(datos.uid)

    }

  }

  async actualizaPerfil(usuario: any){

    const perfilRef = this.db.collection<Usuarios>(this.coleccionUsuarios).doc('/' + this.userDetalle.uid)
 
    const datos: Usuarios = {
      nombre: usuario.nombre,
      busqueda: this.generaClaves(usuario.nombre, usuario.email),
      foto: usuario.foto,
      tipoAdmin: usuario.tipoAdmin === 'true' ? true : false,
      tipoEncargado: usuario.tipoEncargado === 'true' ? true : false,

      // Cuenta asociada
      idCuenta:  usuario.idCuenta,
      emailCuenta: usuario.emailCuenta,
      estado: usuario.estado,
    }
    
    //await setDoc(perfilRef, datos)
    perfilRef.set(datos, { merge: true });      // Salva Datos

    if (usuario.tipoAdmin) {      // si es Administrador salva datos cuenta

     // const cuentaRef = doc(this._dbFS, 'cuentas/', this.userDetalle.uid);
      const cuentaRef = this.db.collection<Cuentas>(this.coleccionCuentas).doc('/' + this.userDetalle.uid)

      const datosCuenta: Cuentas = {
        nombre: usuario.cuentaNombre,
        busqueda: this.generaClaves(usuario.cuentaNombre, usuario.emailCuenta),
        eslogan: usuario.cuentaEslogan,
        foto: usuario.cuentaFoto,
        comparteCuenta: usuario.cuentaComparte,
      }

      //await setDoc(cuentaRef, datos) // Salva Datos Cuenta
      cuentaRef.set(datosCuenta, { merge: true });      // Salva Datos Cuenta

    }

  }

  // actualiza los datos
  async actualizaDato(id:any, info: any) {
    return await this.db.collection<Usuarios>(this.coleccionUsuarios).doc(id).update(info);
  }

  /**
   * 
   * =====================================================
   * Funciones de busqueda de Usuarios y Cuentas 
   * =====================================================
   */


  traeCuenta(idCuenta: any) {

    return this.db.collection<Cuentas>(this.coleccionCuentas).doc('/' + idCuenta).snapshotChanges()
  }

  traeUsuario(idUsuario: any) {
    return this.db.collection<Usuarios>(this.coleccionUsuarios).doc('/' + idUsuario).snapshotChanges();
  }

  buscaCuenta(mail: string){

    return this.db.collection<Cuentas>(this.coleccionCuentas, (ref: any) => ref.where('email', '==', mail)).snapshotChanges()

  }  

  /* Función que suma o resta días a una fecha, si el parámetro
   días es negativo restará los días*/
  private sumarDias(fecha: Date, dias: any){
    fecha.setDate(fecha.getDate() + dias);
    return fecha;

  }

  // -----------------------------------------------------------------------------------------------------
  // @ Manejo de Listados
  // -----------------------------------------------------------------------------------------------------


  /**
   * simple
   * @param id 
   * 
   * busca un determinado documento segun su identificacion
   */
  simple(id: string)  {

    return this.db.collection<Usuarios>(this.coleccionUsuarios).doc('/' + id).snapshotChanges();
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
      .collection<Usuarios>(this.coleccionUsuarios, (ref: any) => {
        let query: CollectionReference | Query = ref;

        // buscar
        if (args!.buscar) {
          query = query.where('busqueda', 'array-contains', args!.buscar)
        }

        
        // sorting
        if (!args!.orderBy){
          args!.orderBy = 'nombre';    // orden por defecto
        }

        query = query.orderBy(args!.orderBy, args!.orderDir);

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
   * =====================================================
   *  generalClaves
   * =====================================================
   * 
   * @param nombre 
   * @param email 
   * 
   * los parametros se ajustan segun las necesidades de cada base de datos
   * esta funcion permite crear claves de busqueda para multiples campos
   * 
   */
  generaClaves(nombre: string, email: string){ // se define los campos de busqueda

    // define posible datos faltantes agregar tantos como haga falta
    const campo1 = nombre.length > 0 ? `${nombre}` : '';
    const campo3 = email.length > 0 ? `${email}` : '';

    // se define las mezclas que se desee tener en cuenta
    const claveNombre = DipsUtils.creaClaves(campo1);
    const soloEmail = DipsUtils.creaClaves(campo3);

    // retorna array
    return [
      ...new Set([
        '',
        ...claveNombre,
        ...soloEmail
      ])
    ];
  }

}

function db<T>(db: any, arg1: string, arg2: string) {
  throw new Error('Function not implemented.');
}

