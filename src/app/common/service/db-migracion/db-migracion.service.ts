// src/app/core/db/db-migration.service.ts

//? ATENCION
/**
 * Este servicio se encarga de la migración de las bases de datos en IndexedDB.
 * hay muchos datos documentados en el código que pueden ser útiles para entender cómo funciona la migración.
 *
 * Para agregar una nueva base de datos, simplemente agregue un nuevo objeto DatabaseConfig al arreglo `databases` con el nombre de la base de datos, la versión actual y la función de migración correspondiente.
 * Cada función de migración debe manejar las versiones anteriores y nuevas de la base de datos, creando o modificando los object stores y sus índices según sea necesario.
 *
 * La función `verifyAndMigrateAll` se encarga de verificar y migrar todas las bases de datos en paralelo, registrando el tiempo que tarda en completarse.
 * La función `migrateRecords` es una utilidad para migrar registros existentes en un object store, aplicando una transformación a cada registro.
 *
 * Nota: Asegúrese de manejar correctamente los errores durante la migración para evitar inconsistencias en la base de datos.
 */

import { Injectable } from '@angular/core';

interface DatabaseConfig {
    name: string;
    currentVersion: number;
    migrate: (db: IDBDatabase, oldVersion: number, newVersion: number) => Promise<void>;
}

@Injectable({
    providedIn: 'root'
})
export class DbMigrationService {

    private databases: DatabaseConfig[] = [
        // {
        //     name: 'productos',
        //     currentVersion: 0,
        //     migrate: this.migrateProductos.bind(this)
        // },
        // {
        //     name: 'clientes',
        //     currentVersion: 0,
        //     migrate: this.migrateClientes.bind(this)
        // },
        {
            name: 'factura',
            currentVersion: 4,
            migrate: this.migrateFactura.bind(this)
        },
        // {
        //     name: 'caja',
        //     currentVersion: 0,
        //     migrate: this.migrateCajas.bind(this)
        // }
    ];

    /**
     * Verifica y migra todas las bases de datos en paralelo
     */
    async verifyAndMigrateAll(): Promise<void> {

        console.log('1 Iniciando migración de bases de datos...');
        //      const startTime = performance.now();

        // Ejecutar todas las verificaciones/migraciones en paralelo
        const promises = this.databases.map(db => this.verifyAndMigrateDb(db));

        console.log(`2 Verificando y migrando ${promises.length} bases de datos...`, promises);

        // try {
        //     await Promise.all(promises);
        //     const endTime = performance.now();
        //     console.log(`✓ Migración completada en ${(endTime - startTime).toFixed(2)}ms`);
        // } catch (error) {
        //     console.error('Error durante la migración:', error);
        //     throw error;
        // }
    }

    private async verifyAndMigrateDb(config: DatabaseConfig): Promise<void> {

        console.log(`Verificando base de datos: ${config.name} (v${config.currentVersion})`);

        return new Promise((resolve, reject) => {
            const request = indexedDB.open(config.name, config.currentVersion);

            console.log(`Abriendo base de datos: ${config.name} (v${config.currentVersion})`);

            request.onupgradeneeded = async (event) => {
                const db = request.result;
                const oldVersion = event.oldVersion || 0;
                const newVersion = event.newVersion || config.currentVersion;

                console.log(`⚡ Migrando ${config.name}: v${oldVersion} → v${newVersion}`);

                try {
                    console.log(`Migrando ${config.name}...`);
                    await config.migrate(db, oldVersion, newVersion);
                    console.log(`✓ ${config.name} migrada exitosamente`);
                } catch (error) {
                    console.error(`✗ Error migrando ${config.name}:`, error);
                    reject(error);
                }
            };

            request.onsuccess = () => {
                // La DB ya está en la versión correcta o se acaba de migrar
                const db = request.result;
                db.close();
                resolve();
            };

            request.onerror = () => {
                reject(request.error);
            };
        });
    }

    // private async migrateProductos(db: IDBDatabase, oldVersion: number, newVersion: number): Promise<void> {
    //     const transaction = (db as any).transaction;

    //     // Migración versión 1 → 2
    //     if (oldVersion < 2) {
    //         if (!db.objectStoreNames.contains('productos')) {
    //             const store = db.createObjectStore('productos', { keyPath: 'id', autoIncrement: true });
    //             store.createIndex('codigo', 'codigo', { unique: true });
    //             store.createIndex('nombre', 'nombre', { unique: false });
    //         }
    //     }

    //     // Migración versión 2 → 3
    //     if (oldVersion < 3) {
    //         const store = transaction.objectStore('productos');

    //         // Agregar nuevo índice
    //         if (!store.indexNames.contains('categoria')) {
    //             store.createIndex('categoria', 'categoria', { unique: false });
    //         }

    //         // Migrar datos existentes
    //         await this.migrateRecords(store, (record) => {
    //             if (!record.categoria) {
    //                 record.categoria = 'general';
    //             }
    //             if (!record.activo) {
    //                 record.activo = true;
    //             }
    //             return record;
    //         });
    //     }
    // }

    // private async migrateClientes(db: IDBDatabase, oldVersion: number, newVersion: number): Promise<void> {
    //     const transaction = (db as any).transaction;

    //     // if (oldVersion < 2) {
    //     //     if (!db.objectStoreNames.contains('clientes')) {
    //     //         const store = db.createObjectStore('clientes', { keyPath: 'id', autoIncrement: true });
    //     //         store.createIndex('email', 'email', { unique: true });
    //     //         store.createIndex('telefono', 'telefono', { unique: false });
    //     //     }

    //     //     const store = transaction.objectStore('clientes');
    //     //     await this.migrateRecords(store, (record) => {
    //     //         if (!record.fechaRegistro) {
    //     //             record.fechaRegistro = new Date().toISOString();
    //     //         }
    //     //         return record;
    //     //     });
    //     // }
    // }

    private async migrateFactura(db: IDBDatabase, oldVersion: number, newVersion: number): Promise<void> {
        console.log(`Migrando factura: v${oldVersion} → v${newVersion}`);
        const transaction = (db as any).transaction;

        if (oldVersion < 4) {
            if (!db.objectStoreNames.contains('factura')) {
                const store = db.createObjectStore('factura');
                store.createIndex('cajaIndex', 'idCaja', { unique: false });
            }

            const store = transaction.objectStore('factura');
            await this.migrateRecords(store, (record) => {
                console.log('Migrando registro de factura:', record);
                if (!record.idCaja) {
                    record.idCaja = 1;
                }
                return record;
            });
        }
    }

    /**
     * Migra registros de un store de forma eficiente
     */
    private migrateRecords(
        store: IDBObjectStore,
        transform: (record: any) => any
    ): Promise<void> {
        return new Promise((resolve, reject) => {
            const cursorRequest = store.openCursor();

            cursorRequest.onsuccess = () => {
                const cursor = cursorRequest.result;

                if (!cursor) {
                    resolve();
                    return;
                }

                const updatedRecord = transform(cursor.value);

                if (updatedRecord) {
                    const updateRequest = cursor.update(updatedRecord);
                    updateRequest.onerror = () => reject(updateRequest.error);
                }

                cursor.continue();
            };

            cursorRequest.onerror = () => reject(cursorRequest.error);
        });
    }
}