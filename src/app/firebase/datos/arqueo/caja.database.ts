// app/principal/caja/caja.database.ts
import { Injectable } from '@angular/core';
import { AngularFirestore, CollectionReference, Query } from '@angular/fire/compat/firestore';
import { Cajas, CajasListadoRequest, CajasListadoItem } from './caja.model';
import { DipsUsuarioService } from 'src/@dips/services/usuario.service';
import { environment } from 'src/environments/environment';
import { take } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class CajasDatabase {
    coleccion = 'cajas';
    orden = 'fecha';
    private _coleccionBase = '';
    private usuario: any;

    constructor(
        private db: AngularFirestore,
        private _dipsUsuarioService: DipsUsuarioService
    ) {
        this._coleccionBase = environment.production ? 'cuentas' : 'zTest-cuentas';
        this._dipsUsuarioService.getUsuario().subscribe((u: any) => this.usuario = u);
    }

    /** Trae una caja por ID (snapshotChanges para reactividad) */
    simple(id: string) {
        return this.db.collection(this._coleccionBase)
            .doc(this.usuario.idCuenta)
            .collection<Cajas>(this.coleccion)
            .doc(id)
            .snapshotChanges();
    }

    /** Trae una caja como Promesa (una sola vez) */
    async getById(id: string): Promise<Cajas | undefined> {
        const snap = await this.db.collection(this._coleccionBase)
            .doc(this.usuario.idCuenta)
            .collection<Cajas>(this.coleccion)
            .doc(id)
            .ref.get();
        if (snap.exists) {
            return { id: snap.id, ...snap.data() } as Cajas;
        }
        return undefined;
    }

    /** Trae la caja abierta actual del usuario (si existe) */
    async getCajaAbiertaActual(): Promise<Cajas | undefined> {
        const snap = await this.db.collection(this._coleccionBase)
            .doc(this.usuario.idCuenta)
            .collection<Cajas>(this.coleccion, ref =>
                ref.where('cerrada', '==', false)
                    .where('usuario', '==', this.usuario.email)
                    .limit(1)
            ).ref.get();

        if (snap.empty) return undefined;
        const doc = snap.docs[0];
        return { id: doc.id, ...doc.data() } as Cajas;
    }

    /** Listado paginado */
    listado(args?: CajasListadoRequest) {
        // ✅ Garantizamos que args nunca sea undefined
        args = args || {};

        return this.db
            .collection(this._coleccionBase).doc(this.usuario.idCuenta)
            .collection<Cajas>(this.coleccion, ref => {
                let query: CollectionReference | Query = ref;
                if (args?.buscar) {
                    query = query.where('claves', 'array-contains', args.buscar);
                }
                if (args?.filtro) {
                    query = query.where('cerrada', '==', args.filtro === 'abierta' ? false : true);
                }
                if (!args?.orderBy) args.orderBy = this.orden;
                query = query.orderBy(args.orderBy, args.orderDir || 'desc');
                if (args?.pageSize || args?.limit) {
                    if (args.startAt) query = query.startAt(...args.startAt);
                    if (args.startAfter) query = query.startAfter(...args.startAfter);
                    if (args.endAt) query = query.endAt(...args.endAt);
                    if (args.endBefore) query = query.endBefore(...args.endBefore);
                    query = query.limit(args.limit || args.pageSize || 25);
                }
                return query;
            })
            .snapshotChanges();
    }

    async actualizaDato(id: any, info: any) {
        return await this.db.collection(this._coleccionBase)
            .doc(this.usuario.idCuenta)
            .collection<Cajas>(this.coleccion)
            .doc(id).update(info);
    }

    async ingresaDato(info: any) {
        return await this.db.collection(this._coleccionBase)
            .doc(this.usuario.idCuenta)
            .collection<Cajas>(this.coleccion).add(info);
    }

    async ingresaDatoID(id: any, info: any) {
        return await this.db.collection(this._coleccionBase)
            .doc(this.usuario.idCuenta)
            .collection<Cajas>(this.coleccion).doc(id).set(info);
    }

    async borraDato(id: string) {
        return await this.db.collection(this._coleccionBase)
            .doc(this.usuario.idCuenta)
            .collection<Cajas>(this.coleccion).doc(id).delete();
    }
}