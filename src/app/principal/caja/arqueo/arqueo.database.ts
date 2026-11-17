import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import firebase from 'firebase/compat/app';
import 'firebase/compat/firestore';
import { Caja, MEDIOS_PAGO, MovimientoCaja, indicadoresCaja, indicadoresMovimiento } from './arqueo.model';
import { DipsUtils } from 'src/@dips/utils';
import { DipsUsuarioService } from 'src/@dips/services/usuario.service';
import { environment } from 'src/environments/environment';

@Injectable({ providedIn: 'root' })
export class ArqueoDatabase {
    private _coleccionBase = environment.production ? 'cuentas' : 'zTest-cuentas';
    private _coleccion = 'cajas';
    private usuario: any;

    constructor(
        private db: AngularFirestore,
        private _dipsUsuarioService: DipsUsuarioService
    ) {
        this._dipsUsuarioService.getUsuario().subscribe((usuario) => {
            if (usuario) this.usuario = usuario;
        });
    }

    simple(id: string): Observable<any> {
        return this.db.collection(this._coleccionBase)
            .doc(this.usuario.idCuenta)
            .collection<Caja>(this._coleccion)
            .doc(id)
            .snapshotChanges();
    }

    cierres(idCuenta: string): Observable<Caja[]> {
        return this.db.collection(this._coleccionBase).doc(idCuenta)
            .collection<Caja>(this._coleccion, ref => ref.where('cerrada', '==', true))
            .valueChanges({ idField: 'id' })
            .pipe(map(documentos => documentos
                // Las altas comienzan cerradas, pero todavía no tienen un cierre realizado.
                .filter(documento => !!documento.fechaCierre)
                .map(documento => new Caja(documento))));
    }

    ultima(): Observable<Caja | null> {
        return this.db.collection(this._coleccionBase)
            .doc(this.usuario.idCuenta)
            .collection<Caja>(this._coleccion, ref =>
                ref.orderBy('fechaApertura', 'desc').limit(1))
            .get()
            .pipe(map(resultado => {
                const documento = resultado.docs[0];
                return documento
                    ? new Caja({ ...documento.data(), id: documento.id })
                    : null;
            }));
    }

    async ingresaDato(info: Caja) {
        const { fechaApertura, fechaCierre, ...datos } = info;
        return await this.db.collection(this._coleccionBase)
            .doc(this.usuario.idCuenta)
            .collection(this._coleccion)
            .doc(info.id)
            .ref.set({
                ...datos,
                // Toda alta comienza cerrada; la apertura es una actualización posterior.
                cerrada: true,
                fechaApertura: firebase.firestore.FieldValue.serverTimestamp(),
                ...(fechaCierre ? { fechaCierre } : {})
            });
    }

    async registrarCobro(movimiento: MovimientoCaja): Promise<void> {
        if (!Number.isFinite(movimiento.monto) || movimiento.monto <= 0) return;
        const medioPago = MEDIOS_PAGO.find(medio => medio.codigo === movimiento.datos.charAt(0));
        if (!medioPago) throw new Error('El tipo de moneda no es válido.');

        let caja = await this.ultima().toPromise();
        const crearNueva = !caja || caja.cerrada;
        if (crearNueva) {
            caja = new Caja({
                id: DipsUtils.generateGUID(),
                puntoVenta: this.usuario.idCuenta,
                usuario: this.usuario.email || ''
            });
            await this.ingresaDato(caja);
        }

        const referencia = this.db.collection(this._coleccionBase)
            .doc(this.usuario.idCuenta).collection(this._coleccion).doc(caja!.id).ref;

        await this.db.firestore.runTransaction(async transaccion => {
            const documento = await transaccion.get(referencia);
            if (!documento.exists) throw new Error('La caja ya no existe.');
            const actual = new Caja(documento.data());
            if (actual.cerrada && (!crearNueva || actual.fechaCierre)) {
                throw new Error('La caja se cerró durante el cobro. Volvé a intentarlo.');
            }
            transaccion.update(referencia, {
                cerrada: false,
                movimientos: [...actual.movimientos, movimiento],
                datos: indicadoresCaja(actual) | indicadoresMovimiento(movimiento),
                [`totales.${medioPago.clave}`]: (Number(actual.totales[medioPago.clave]) || 0) + movimiento.monto,
                'totales.movimientos': (Number(actual.totales.movimientos) || 0) + 1
            });
        });
    }

    async actualizaDato(id: string, info: any) {
        // La fecha de creación permanece estable al editar o cerrar la caja.
        const { fechaApertura, ...datos } = info;
        const cambios: { [campo: string]: any } = {};
        Object.entries(datos).forEach(([campo, valor]) => {
            if (valor !== undefined) cambios[campo] = valor;
        });
        return await this.db.collection(this._coleccionBase)
            .doc(this.usuario.idCuenta)
            .collection<Caja>(this._coleccion)
            .doc(id)
            .update(cambios);
    }

    async borraDato(id: string) {
        return await this.db.collection(this._coleccionBase)
            .doc(this.usuario.idCuenta)
            .collection<Caja>(this._coleccion)
            .doc(id)
            .delete();
    }
}
