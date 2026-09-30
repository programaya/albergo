// Importamos Dependecias
import { Injectable } from '@angular/core';
import { AngularFireDatabase, AngularFireList } from '@angular/fire/compat/database';

import { DipsUsuarioService } from 'src/@dips/services/usuario.service';
import { environment } from 'src/environments/environment';

import { albergoParametro } from 'src/@dips/services/parametro/parametro.model';
import { Observable, combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';

// Tablas
import { TablaDatos } from './firebase.model';
import { TablaHabitacion } from './firebase.model';
import { TablaItemUnido } from './firebase.model';


@Injectable({
  providedIn: 'root'
})

export class FireBDService {

  // variables privadas  
  private usuario: any;  // Usuario
  private dbPathDat: any;  // = '/cuentas/' + idCuenta; // Base de Datos
  private dbPathHab: any;  // = '/cuentas/' + idCuenta; // Base de Datos
  private rutaBase: any; // ruta base de firebase

 	// Usamos el Servicio 'AngularFireList' de Angular Fire
 	//datosRef: AngularFireList<TablaDatos> | null = null;


  item!: Observable<any>;

  constructor(
        private db: AngularFireDatabase,
        private _dipsUsuarioService: DipsUsuarioService) 
        {

          // enviroment de prueba o produccion
          if (environment.production) {
            this.rutaBase = '/cuentas/'  

          } else {
            this.rutaBase = '/test_cuentas/'
 
          }


          // Datos de Usuario
          this._dipsUsuarioService.getUsuario()
            .subscribe((usuario: any) => {
              this.usuario = usuario;
              this.dbPathHab = this.rutaBase + this.usuario.idCuenta + '/habitaciones/'
              this.dbPathDat = this.rutaBase + this.usuario.idCuenta + '/datos/'
              //this.datosRef = db.list(this.dbPathDat);

          });

  }

  obtenerItemsUnidos(): Observable<TablaItemUnido[]>  {

    const tablaDatos$ = this.db.list<TablaDatos>(this.dbPathDat)
                          .snapshotChanges()
                          .pipe(map(cambios => cambios.map(c => ({ key: c.payload.key, ...c.payload.val() })))
    );

    const tablaHabitacion$ = this.db.object<{[key: string]: TablaHabitacion}>(this.dbPathHab).valueChanges();

    return combineLatest([tablaDatos$, tablaHabitacion$]).pipe(
      map(([TablaDatos, TablaHabitacion]) => {
        return TablaDatos.map( (itemDatos: any) => {

          const relacionTablaHabitacion = TablaHabitacion ? TablaHabitacion[itemDatos.id] : null;
          
          return {

            // Datos de Habitacion
            id: itemDatos.key,
            nombre: itemDatos.nombre,
            automatico: itemDatos.automatico,
            fueSucia: itemDatos.fueSucia,                   
            datos: itemDatos.datos, 
            valor: itemDatos.valor, 
            pagado: itemDatos.pagado,
            promoUID: itemDatos.promoUID,
          
            // Tabla Habitacion
            cuarto: relacionTablaHabitacion ? relacionTablaHabitacion.cuarto : false,
            garage: relacionTablaHabitacion ? relacionTablaHabitacion.garage : false,
            estado: relacionTablaHabitacion ? relacionTablaHabitacion.estado : 0,
            horaInicio: relacionTablaHabitacion ? relacionTablaHabitacion.horaInicio : 0,
            periodo: relacionTablaHabitacion ? relacionTablaHabitacion.periodo : 0,
            aviso: relacionTablaHabitacion ? relacionTablaHabitacion.aviso : 0,
          };
        });
      })
    );
  }

  traerTablaDatos(): AngularFireList<TablaDatos> {

    return this.db.list<TablaDatos>(this.dbPathDat);

  }

  async actualiza(cuartoId: any, datos?: any, habita?: any): Promise<void> {

    const datRef = this.db.object(this.dbPathDat + cuartoId);
    const habRef = this.db.object(this.dbPathHab + cuartoId);

    if (datos) {
      await datRef.update(datos)

    }

    if (habita) {
      await habRef.update(habita)

    }

  }

  // crear(cuartoId: any, sensor: Sensor): any {
  //   const sensorRef = this.db.object(this.dbPath + cuartoId);
  //   sensorRef.set(sensor);
  // }

  // lee(cuartoId: any): any {  
  //   const sensorRef = this.db.object(this.dbPath + cuartoId);
  //   this.item = sensorRef.valueChanges()
  //   return this.item;
  // }



  // actualizaComandos(key: any, datos: any): Promise<void> {
  //   return this.sensoresRef!.update(key, datos);
  // } */


  // funciones de parametros
  parametros(parametro: albergoParametro): any {

    const parametroRef = this.db.object(this.rutaBase + parametro.uid + '/parametros');
    parametroRef.set(parametro);
  }

  leeParametros() {
    const parametroRef = this.db.object(this.rutaBase + this.usuario.idCuenta + '/parametros')
    return parametroRef.valueChanges()
  }

  actualizaParametros(datos: any): Promise<void> {
    console.log("datos a salvar", datos)
    console.log("ruta", this.rutaBase + this.usuario.idCuenta + '/parametros')
    const sensorRef = this.db.object(this.rutaBase + this.usuario.idCuenta + '/parametros');
    return sensorRef.update(datos);
  }

}

/* 
import { Injectable } from '@angular/core';
import { AngularFireDatabase } from '@angular/fire/compat/database';
import { Observable, combineLatest, map } from 'rxjs';

interface Tabla1 {
  nombre: string;
  descripcion: string;
  id_comun: string;
  // Otros campos de tabla1
}

interface Tabla2 {
  precio: number;
  categoria: string;
  // Otros campos de tabla2
}

interface Tabla3 {
  stock: number;
  proveedor: string;
  // Otros campos de tabla3
}

interface ItemUnido {
  id: string; // ID de tabla1
  nombre: string;
  descripcion: string;
  precio: number;
  categoria: string;
  stock: number;
  proveedor: string;
}

@Injectable({
  providedIn: 'root'
})
export class DataUnidaService {

  constructor(private db: AngularFireDatabase) { }

  obtenerItemsUnidos(): Observable<ItemUnido[]> {
    const tabla1$ = this.db.list<Tabla1>('tabla1').snapshotChanges().pipe(
      map(changes => changes.map(c => ({ key: c.payload.key, ...c.payload.val() })))
    );

    const tabla2$ = this.db.object<{[key: string]: Tabla2}>('tabla2').valueChanges();
    const tabla3$ = this.db.object<{[key: string]: Tabla3}>('tabla3').valueChanges();

    return combineLatest([tabla1$, tabla2$, tabla3$]).pipe(
      map(([tabla1, tabla2, tabla3]) => {
        return tabla1.map(item1 => {
          const relacionTabla2 = tabla2 ? tabla2[item1.id_comun] : null;
          const relacionTabla3 = tabla3 ? tabla3[item1.id_comun] : null;

          return {
            id: item1.key,
            nombre: item1.nombre,
            descripcion: item1.descripcion,
            precio: relacionTabla2 ? relacionTabla2.precio : null,
            categoria: relacionTabla2 ? relacionTabla2.categoria : null,
            stock: relacionTabla3 ? relacionTabla3.stock : null,
            proveedor: relacionTabla3 ? relacionTabla3.proveedor : null,
          };
        });
      })
    );
  }
} 

*/