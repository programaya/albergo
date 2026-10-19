import { Component, computed, inject, signal, Optional, Inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DipsUsuarioService } from '@serv/usuario/usuario.service';
import { NgxIndexedDBService } from 'ngx-indexed-db';
import { firstValueFrom } from 'rxjs';
import { Caja, Cajas } from '@dbTabla/caja.model';
import { MatDialogModule, MAT_DIALOG_DATA } from '@angular/material/dialog';

// Componentes de totales
import { TotalEfectivoComponent } from './total-efectivo/total-efectivo.component';
import { TotalDebitoComponent } from './total-debito/total-debito.component';
import { TotalCreditoComponent } from './total-credito/total-credito.component';
import { TotalBilleteraComponent } from './total-billetera/total-billetera.component';
import { TotalChequeComponent } from './total-cheque/total-cheque.component';
import { TotalTransferenciaComponent } from './total-transferencia/total-transferencia.component';
import { TotalCtacteComponent } from './total-ctacte/total-ctacte.component';
import { TotalGastoComponent } from './total-gasto/total-gasto.component';
import { MontoInicialComponent } from './monto-inicial/monto-inicial.component';
import { MontoArqueoComponent } from './monto-arqueo/monto-arqueo.component';

import { MatButtonModule } from '@angular/material/button';
import { NgIf } from '@angular/common';
import { IdGeneratorService } from '@serv/uid/id-generador.service';
import { CajaGestorService } from '../listado/service/gestor-caja.service';
import { DipsDialogoService } from '@serv/dialogo/dips-dialog.service'

// Tour
import { NgxWebTourModule } from '@abbasmgz/ngx-web-tour';

@Component({
    selector: 'app-arqueo',
    imports: [
        MatDialogModule, MatButtonModule, NgIf,
        TotalEfectivoComponent, TotalDebitoComponent, TotalCreditoComponent,
        TotalBilleteraComponent, TotalChequeComponent, TotalTransferenciaComponent,
        TotalCtacteComponent, TotalGastoComponent, MontoInicialComponent, MontoArqueoComponent,
        NgxWebTourModule
    ],
    templateUrl: './arqueo.component.html',
    styleUrls: ['./arqueo.component.scss']
})
export class ArqueoComponent implements OnInit {

    #route = inject(ActivatedRoute);
    #router = inject(Router);
    #dbService = inject(NgxIndexedDBService);
    #idGenerator = inject(IdGeneratorService);
    #cajaGestor = inject(CajaGestorService);

    cajaId?: string | null;
    cuentaDatos: any;
    puntoVenta: any;

    cajaIdActual = signal<string | null>(null);
    cajaData = signal<Caja | null>(null);

    totalGastos = computed(() => {
        const caja = this.cajaData();
        if (!caja || !caja.gastos || caja.gastos.length === 0) return 0;
        return caja.gastos.reduce((acumulado, gasto) => acumulado + (gasto.monto || 0), 0);
    });

    #dialogo = inject(DipsDialogoService)

    constructor(
        private _usuarioService: DipsUsuarioService,
        @Optional() @Inject(MAT_DIALOG_DATA) public dialogData?: any
    ) { }

    ngOnInit() {
        this.cajaId = this.#route.snapshot.params['id'];

        this._usuarioService.cuenta$.subscribe((cuenta) => {
            this.cuentaDatos = cuenta;
            if (cuenta) {
                this.puntoVenta = this._usuarioService.getPuntoVentaActual;
                const idAProcesar = this.cajaId ?? this.dialogData?.cajaId ?? null;
                this.procesarEstadoCaja(idAProcesar);
            }
        });
    }

    async procesarEstadoCaja(cajaIdEntrante?: string | null) {
        if (!cajaIdEntrante || cajaIdEntrante === "todoCerrado") {
            console.log('[Caja] Estado: Todo cerrado. Esperando acción del usuario para abrir.');
            this.cajaIdActual.set("todoCerrado");
            this.cajaData.set(null);
            return;
        }

        try {
            const cajaEncontrada = await firstValueFrom(
                this.#dbService.getByKey('caja', cajaIdEntrante)
            ) as Caja | undefined;

            if (cajaEncontrada) {
                this.cajaData.set({ ...cajaEncontrada });
                this.cajaIdActual.set(cajaEncontrada.id);
            } else {
                console.warn(`[Caja] No se encontró caja con ID: ${cajaIdEntrante}.`);
                this.cajaIdActual.set("todoCerrado");
                this.cajaData.set(null);
            }
        } catch (error) {
            console.error('[Caja] Error al cargar la caja:', error);
            this.cajaIdActual.set("todoCerrado");
            this.cajaData.set(null);
        }
    }

    async actualizarMontoInicial(nuevoMonto: number) {
        if (this.cajaIdActual() === 'todoCerrado' || !this.cajaIdActual()) {
            console.log(`[Caja] Abriendo caja con monto inicial de: ${nuevoMonto}`);
            await this.abrirNuevaCaja(nuevoMonto, false);
        } else {
            const caja = this.cajaData();
            if (caja) {
                this.cajaData.set({ ...caja, montoInicial: nuevoMonto });
                await this.guardarCambiosCaja();
            }
        }
    }

    /**
     * 🆕 NUEVO MÉTODO: Maneja actualizaciones de gastos desde el modal
     * Si la caja está cerrada, abre una nueva con los gastos. Si está abierta, actualiza.
     */
    async actualizarGastos(cajaConGastos: Caja) {
        if (this.cajaIdActual() === 'todoCerrado' || !this.cajaIdActual()) {
            // ✅ Si está cerrada, abrimos nueva caja con los gastos
            console.log('[Caja] Abriendo caja con gastos registrados desde modal');
            await this.abrirNuevaCajaConGastos(cajaConGastos);
        } else {
            // ✅ Si ya hay caja abierta, actualizamos los gastos
            this.cajaData.set({ ...cajaConGastos });
            await this.guardarCambiosCaja();
        }
    }

    /**
     * 🆕 NUEVO MÉTODO: Crea una nueva caja con los gastos del modal
     */
    async abrirNuevaCajaConGastos(cajaConGastos: Caja) {
        try {
            const puntoVentaActual = this._usuarioService.getPuntoVentaActual;
            if (!puntoVentaActual) {
                console.error('[Caja] No se puede abrir la caja: Punto de venta no asignado.');
                return;
            }

            const nuevaCaja = new Cajas();
            nuevaCaja.cerrada = false;
            nuevaCaja.puntoVenta = puntoVentaActual;
            nuevaCaja.fechaApertura = new Date();
            nuevaCaja.montoInicial = 0; // Monto inicial en 0, se puede ajustar después
            nuevaCaja.montoCierre = 0;
            nuevaCaja.gastos = cajaConGastos.gastos || []; // 👈 Usamos los gastos del modal
            nuevaCaja.datos = 0;
            nuevaCaja.totales = {
                movimientos: 0, efectivo: 0, debito: 0, credito: 0,
                billetera: 0, transferencia: 0, cheque: 0, ctacte: 0
            };
            nuevaCaja.usuario = this.cuentaDatos?.usuario || 'Desconocido';

            const idString = this.#idGenerator.generarId();
            nuevaCaja.id = idString;

            // Guardar en IndexedDB
            await firstValueFrom(this.#dbService.add('caja', nuevaCaja));

            // Notificar al gestor global
            this.#cajaGestor.notificarCambioEnCaja();

            // Actualizar estado reactivo local
            this.cajaData.set({ ...nuevaCaja });
            this.cajaIdActual.set(idString);

            console.log(`[Caja] Nueva caja creada con gastos. ID: ${idString}, Total gastos: ${this.totalGastos()}`);

        } catch (error) {
            console.error('[Caja] Error crítico al crear caja con gastos:', error);
        }
    }

    async abrirNuevaCaja(montoInicialForzado?: number, navegar: boolean = true) {
        try {
            console.log('[Caja] Iniciando creación de nueva caja...');

            const puntoVentaActual = this._usuarioService.getPuntoVentaActual;
            if (!puntoVentaActual) {
                console.error('[Caja] No se puede abrir la caja: Punto de venta no asignado.');
                return;
            }

            const nuevaCaja = new Cajas();
            nuevaCaja.cerrada = false;
            nuevaCaja.puntoVenta = puntoVentaActual;
            nuevaCaja.fechaApertura = new Date();
            nuevaCaja.montoInicial = montoInicialForzado ?? 0;
            nuevaCaja.montoCierre = 0;
            nuevaCaja.gastos = [];
            nuevaCaja.datos = 0;
            nuevaCaja.totales = {
                movimientos: 0, efectivo: 0, debito: 0, credito: 0,
                billetera: 0, transferencia: 0, cheque: 0, ctacte: 0
            };
            nuevaCaja.usuario = this.cuentaDatos?.usuario || 'Desconocido';

            const idString = this.#idGenerator.generarId();
            nuevaCaja.id = idString;

            await firstValueFrom(this.#dbService.add('caja', nuevaCaja));
            this.#cajaGestor.notificarCambioEnCaja();
            this.cajaData.set({ ...nuevaCaja });
            this.cajaIdActual.set(idString);

            console.log(`[Caja] Nueva caja creada y abierta exitosamente con ID: ${idString}`);

            if (navegar) {
                this.#router.navigate(['/caja/listado']);
            }

        } catch (error) {
            console.error('[Caja] Error crítico al crear la caja:', error);
        }
    }

    async guardarCambiosCaja() {
        const cajaActual = this.cajaData();
        if (cajaActual) {
            try {
                await firstValueFrom(this.#dbService.update('caja', cajaActual));
                this.#cajaGestor.notificarCambioEnCaja();
            } catch (error) {
                console.error('[Caja] Error al guardar cambios:', error);
            }
        }
    }

    actualizarCaja(nuevaCaja: Caja) {
        this.cajaData.set({ ...nuevaCaja });
        this.guardarCambiosCaja();
    }

    actualizarMontoCierre(nuevoMonto: number) {
        const caja = this.cajaData();
        if (caja) {
            this.cajaData.set({ ...caja, montoCierre: nuevoMonto });
            this.guardarCambiosCaja();
        }
    }

    async verificaCierre() {
        const diferencia = (this.cajaData()?.montoCierre || 0) -
            (this.cajaData()?.totales.efectivo || 0) -
            (this.cajaData()?.montoInicial || 0) -
            (this.cajaData()?.gastos.reduce((acc, gasto) => acc + gasto.monto, 0) || 0) // gastos

        console.log(`[Caja] Diferencia calculada: ${diferencia}`);

        if (diferencia !== 0) {
            this.#dialogo.confirm(
                `La diferencia entre el monto de cierre y los totales es de ${diferencia}.\n\n` +
                `¿Desea continuar con el cierre de la caja?`,
                {
                    titulo: 'Confirmar cierre de caja',
                    btnAceptar: 'Continuar',
                    btnCancela: 'Cancelar',
                    tipo: 'info'
                }
            ).subscribe(async (respuesta: boolean | undefined) => {
                if (respuesta === true) {
                    // Lógica para continuar con el cierre de la caja
                    this.cerrarCaja();
                }
            });
        } else {
            // Si no hay diferencia, cerramos la caja directamente
            this.cerrarCaja();
        }
    }

    async cerrarCaja() {
        const caja = this.cajaData();

        // Lógica para continuar con el cierre de la caja
        if (caja) {
            caja.cerrada = true;
            caja.fechaCierre = new Date();
            this.cajaData.set({ ...caja });
            await this.guardarCambiosCaja();
            this.#router.navigate(['/caja/listado']);
        }
    }

    salir() {
        console.log('[Caja] Saliendo de la vista de arqueo.');
    }
}



//////////////////////////////////////////////////////////////////////////
// import { Component, computed, inject, signal, Optional, Inject, OnInit } from '@angular/core';
// import { ActivatedRoute, Router } from '@angular/router';
// import { DipsUsuarioService } from '@serv/usuario/usuario.service';
// import { NgxIndexedDBService } from 'ngx-indexed-db';
// import { firstValueFrom } from 'rxjs';
// import { Caja, Cajas } from '@dbTabla/caja.model';
// import { MatDialogModule, MAT_DIALOG_DATA } from '@angular/material/dialog';

// // Componentes de totales
// import { TotalEfectivoComponent } from './total-efectivo/total-efectivo.component';
// import { TotalDebitoComponent } from './total-debito/total-debito.component';
// import { TotalCreditoComponent } from './total-credito/total-credito.component';
// import { TotalBilleteraComponent } from './total-billetera/total-billetera.component';
// import { TotalChequeComponent } from './total-cheque/total-cheque.component';
// import { TotalTransferenciaComponent } from './total-transferencia/total-transferencia.component';
// import { TotalCtacteComponent } from './total-ctacte/total-ctacte.component';
// import { TotalGastoComponent } from './total-gasto/total-gasto.component';
// import { MontoInicialComponent } from './monto-inicial/monto-inicial.component';
// import { MontoArqueoComponent } from './monto-arqueo/monto-arqueo.component';

// import { MatButtonModule } from '@angular/material/button';
// import { NgIf } from '@angular/common';
// import { IdGeneratorService } from '@serv/uid/id-generador.service';
// import { CajaGestorService } from '../listado/service/gestor-caja.service';

// @Component({
//     selector: 'app-arqueo',
//     imports: [
//         MatDialogModule, MatButtonModule, NgIf,
//         TotalEfectivoComponent, TotalDebitoComponent, TotalCreditoComponent,
//         TotalBilleteraComponent, TotalChequeComponent, TotalTransferenciaComponent,
//         TotalCtacteComponent, TotalGastoComponent, MontoInicialComponent, MontoArqueoComponent
//     ],
//     templateUrl: './arqueo.component.html',
//     styleUrls: ['./arqueo.component.scss']
// })
// export class ArqueoComponent implements OnInit {

//     #route = inject(ActivatedRoute);
//     #router = inject(Router);
//     #dbService = inject(NgxIndexedDBService);
//     #idGenerator = inject(IdGeneratorService);
//     #cajaGestor = inject(CajaGestorService);

//     cajaId?: string | null;
//     cuentaDatos: any;
//     puntoVenta: any;

//     cajaIdActual = signal<string | null>(null);
//     cajaData = signal<Caja | null>(null);

//     totalGastos = computed(() => {
//         const caja = this.cajaData();
//         if (!caja || !caja.gastos || caja.gastos.length === 0) return 0;
//         return caja.gastos.reduce((acumulado, gasto) => acumulado + (gasto.monto || 0), 0);
//     });

//     constructor(
//         private _usuarioService: DipsUsuarioService,
//         @Optional() @Inject(MAT_DIALOG_DATA) public dialogData?: any
//     ) { }

//     ngOnInit() {
//         this.cajaId = this.#route.snapshot.params['id'];

//         this._usuarioService.cuenta$.subscribe((cuenta) => {
//             this.cuentaDatos = cuenta;
//             if (cuenta) {
//                 this.puntoVenta = this._usuarioService.getPuntoVentaActual;
//                 const idAProcesar = this.cajaId ?? this.dialogData?.cajaId ?? null;
//                 this.procesarEstadoCaja(idAProcesar);
//             }
//         });
//     }

//     async procesarEstadoCaja(cajaIdEntrante?: string | null) {
//         if (!cajaIdEntrante || cajaIdEntrante === "todoCerrado") {
//             console.log('[Caja] Estado: Todo cerrado. Esperando acción del usuario para abrir.');
//             this.cajaIdActual.set("todoCerrado");
//             this.cajaData.set(null);
//             return;
//         }

//         try {
//             const cajaEncontrada = await firstValueFrom(
//                 this.#dbService.getByKey('caja', cajaIdEntrante)
//             ) as Caja | undefined;

//             if (cajaEncontrada) {
//                 this.cajaData.set({ ...cajaEncontrada });
//                 this.cajaIdActual.set(cajaEncontrada.id);
//             } else {
//                 console.warn(`[Caja] No se encontró caja con ID: ${cajaIdEntrante}.`);
//                 this.cajaIdActual.set("todoCerrado");
//                 this.cajaData.set(null);
//             }
//         } catch (error) {
//             console.error('[Caja] Error al cargar la caja:', error);
//             this.cajaIdActual.set("todoCerrado");
//             this.cajaData.set(null);
//         }
//     }

//     async actualizarMontoInicial(nuevoMonto: number) {
//         // ✅ Condición ampliada para asegurar que se detecte el estado cerrado
//         if (this.cajaIdActual() === 'todoCerrado' || !this.cajaIdActual()) {
//             console.log(`[Caja] Abriendo caja con monto inicial de: ${nuevoMonto}`);
//             await this.abrirNuevaCaja(nuevoMonto, false);
//         } else {
//             const caja = this.cajaData();
//             if (caja) {
//                 this.cajaData.set({ ...caja, montoInicial: nuevoMonto });
//                 await this.guardarCambiosCaja();
//             }
//         }
//     }

//     async abrirNuevaCaja(montoInicialForzado?: number, navegar: boolean = true) {
//         try {
//             console.log('[Caja] Iniciando creación de nueva caja...');

//             // 🎯 OBTENCIÓN DIRECTA: Evita depender de la variable local que podría estar desactualizada
//             const puntoVentaActual = this._usuarioService.getPuntoVentaActual;
//             if (!puntoVentaActual) {
//                 console.error('[Caja] No se puede abrir la caja: Punto de venta no asignado.');
//                 return;
//             }

//             const nuevaCaja = new Cajas();
//             nuevaCaja.cerrada = false; // Forzamos booleano
//             nuevaCaja.puntoVenta = puntoVentaActual;
//             nuevaCaja.fechaApertura = new Date();
//             nuevaCaja.montoInicial = montoInicialForzado ?? 0;
//             nuevaCaja.montoCierre = 0;
//             nuevaCaja.gastos = [];
//             nuevaCaja.datos = 0;
//             nuevaCaja.totales = {
//                 movimientos: 0, efectivo: 0, debito: 0, credito: 0,
//                 billetera: 0, transferencia: 0, cheque: 0, ctacte: 0
//             };
//             nuevaCaja.usuario = this.cuentaDatos?.usuario || 'Desconocido';

//             const idString = this.#idGenerator.generarId();
//             nuevaCaja.id = idString;

//             // 1. Guardar en IndexedDB
//             await firstValueFrom(this.#dbService.add('caja', nuevaCaja));

//             // 2. Notificar al gestor global (esto actualiza el botón en el listado)
//             this.#cajaGestor.notificarCambioEnCaja();

//             // 3. Actualizar el estado reactivo local
//             this.cajaData.set({ ...nuevaCaja });
//             this.cajaIdActual.set(idString);

//             console.log(`[Caja] Nueva caja creada y abierta exitosamente con ID: ${idString}`);

//             if (navegar) {
//                 this.#router.navigate(['/caja/listado']);
//             }

//         } catch (error) {
//             console.error('[Caja] Error crítico al crear la caja:', error);
//         }
//     }

//     async guardarCambiosCaja() {
//         const cajaActual = this.cajaData();
//         if (cajaActual) {
//             try {
//                 await firstValueFrom(this.#dbService.update('caja', cajaActual));
//                 this.#cajaGestor.notificarCambioEnCaja();
//             } catch (error) {
//                 console.error('[Caja] Error al guardar cambios:', error);
//             }
//         }
//     }

//     actualizarCaja(nuevaCaja: Caja) {
//         this.cajaData.set({ ...nuevaCaja });
//         this.guardarCambiosCaja();
//     }

//     actualizarMontoCierre(nuevoMonto: number) {
//         const caja = this.cajaData();
//         if (caja) {
//             this.cajaData.set({ ...caja, montoCierre: nuevoMonto });
//             this.guardarCambiosCaja();
//         }
//     }

//     async cerrarCaja() {
//         const caja = this.cajaData();
//         if (caja) {
//             caja.cerrada = true;
//             caja.fechaCierre = new Date();
//             this.cajaData.set({ ...caja });
//             await this.guardarCambiosCaja();
//             this.#router.navigate(['/caja/listado']);
//         }
//     }

//     salir() {
//         console.log('[Caja] Saliendo de la vista de arqueo.');
//     }
// }




///////////////////////////////////////////////////////////////////////////////////
// import { Component, computed, inject, signal, Optional, Inject, OnInit } from '@angular/core';
// import { ActivatedRoute, Router } from '@angular/router';
// import { DipsUsuarioService } from '@serv/usuario/usuario.service';
// import { NgxIndexedDBService } from 'ngx-indexed-db';
// import { firstValueFrom } from 'rxjs';
// import { Caja, Cajas } from '@dbTabla/caja.model';
// import { MatDialogModule, MAT_DIALOG_DATA } from '@angular/material/dialog';

// // Componentes de totales
// import { TotalEfectivoComponent } from './total-efectivo/total-efectivo.component';
// import { TotalDebitoComponent } from './total-debito/total-debito.component';
// import { TotalCreditoComponent } from './total-credito/total-credito.component';
// import { TotalBilleteraComponent } from './total-billetera/total-billetera.component';
// import { TotalChequeComponent } from './total-cheque/total-cheque.component';
// import { TotalTransferenciaComponent } from './total-transferencia/total-transferencia.component';
// import { TotalCtacteComponent } from './total-ctacte/total-ctacte.component';
// import { TotalGastoComponent } from './total-gasto/total-gasto.component';
// import { MontoInicialComponent } from './monto-inicial/monto-inicial.component';
// import { MontoArqueoComponent } from './monto-arqueo/monto-arqueo.component';

// import { MatButtonModule } from '@angular/material/button';
// import { NgIf } from '@angular/common';
// import { IdGeneratorService } from '@serv/uid/id-generador.service';
// import { CajaGestorService } from '../listado/service/gestor-caja.service';

// @Component({
//     selector: 'app-arqueo',
//     imports: [
//         MatDialogModule,
//         MatButtonModule,
//         NgIf,
//         TotalEfectivoComponent,
//         TotalDebitoComponent,
//         TotalCreditoComponent,
//         TotalBilleteraComponent,
//         TotalChequeComponent,
//         TotalTransferenciaComponent,
//         TotalCtacteComponent,
//         TotalGastoComponent,
//         MontoInicialComponent,
//         MontoArqueoComponent
//     ],
//     templateUrl: './arqueo.component.html',
//     styleUrls: ['./arqueo.component.scss']
// })
// export class ArqueoComponent implements OnInit {

//     #route = inject(ActivatedRoute);
//     #router = inject(Router);
//     #dbService = inject(NgxIndexedDBService);
//     #idGenerator = inject(IdGeneratorService);
//     #cajaGestor = inject(CajaGestorService);

//     cajaId?: string | null;
//     cuentaDatos: any;
//     puntoVenta: any;

//     cajaIdActual = signal<string | null>(null);
//     cajaData = signal<Caja | null>(null);

//     totalGastos = computed(() => {
//         const caja = this.cajaData();
//         if (!caja || !caja.gastos || caja.gastos.length === 0) return 0;
//         return caja.gastos.reduce((acumulado, gasto) => acumulado + (gasto.monto || 0), 0);
//     });

//     constructor(
//         private _usuarioService: DipsUsuarioService,
//         @Optional() @Inject(MAT_DIALOG_DATA) public dialogData?: any
//     ) { }

//     ngOnInit() {
//         this.cajaId = this.#route.snapshot.params['id'];

//         this._usuarioService.cuenta$.subscribe((cuenta) => {
//             this.cuentaDatos = cuenta;
//             if (cuenta) {
//                 this.puntoVenta = this._usuarioService.getPuntoVentaActual;
//                 const idAProcesar = this.cajaId ?? this.dialogData?.cajaId ?? null;

//                 // Solo evaluamos el estado, NO creamos nada automáticamente
//                 this.procesarEstadoCaja(idAProcesar);
//             }
//         });
//     }


//     /**
//      * Evalúa el ID recibido. Si es "todoCerrado" o null, deja el estado en vacío.
//      * Si es un ID válido, intenta cargarlo de la BD.
//      */
//     async procesarEstadoCaja(cajaIdEntrante?: string | null) {
//         if (!cajaIdEntrante || cajaIdEntrante === "todoCerrado") {
//             console.log('[Caja] Estado: Todo cerrado. Esperando acción del usuario para abrir.');
//             this.cajaIdActual.set("todoCerrado");
//             this.cajaData.set(null);
//             return;
//         }

//         try {
//             const cajaEncontrada = await firstValueFrom(
//                 this.#dbService.getByKey('caja', cajaIdEntrante)
//             ) as Caja | undefined;

//             if (cajaEncontrada) {
//                 this.cajaData.set({ ...cajaEncontrada });
//                 this.cajaIdActual.set(cajaEncontrada.id);
//             } else {
//                 console.warn(`[Caja] No se encontró caja con ID: ${cajaIdEntrante}.`);
//                 this.cajaIdActual.set("todoCerrado");
//                 this.cajaData.set(null);
//             }
//         } catch (error) {
//             console.error('[Caja] Error al cargar la caja:', error);
//             this.cajaIdActual.set("todoCerrado");
//             this.cajaData.set(null);
//         }
//     }

//     /**
//      * Se ejecuta cuando el componente hijo (MontoInicial) emite un cambio.
//      * Decide si debe abrir una caja nueva o solo actualizar una existente.
//      */
//     async actualizarMontoInicial(nuevoMonto: number) {
//         if (this.cajaIdActual() === 'todoCerrado') {
//             // ✅ Si está todo cerrado, abrimos la caja y asentamos este monto como inicio
//             console.log(`[Caja] Abriendo caja con monto inicial de: ${nuevoMonto}`);
//             await this.abrirNuevaCaja(nuevoMonto, false);
//         } else {
//             // ✅ Si ya hay una caja abierta, solo actualizamos el monto en la caja existente
//             const caja = this.cajaData();
//             if (caja) {
//                 this.cajaData.set({ ...caja, montoInicial: nuevoMonto });
//                 await this.guardarCambiosCaja();
//             }
//         }
//     }

//     /**
//      * Crea la caja y opcionalmente navega al listado.
//      * @param montoInicialForzado - Monto inicial de la caja
//      * @param navegar - Si es true, navega al listado de cajas después de crear
//      */
//     async abrirNuevaCaja(montoInicialForzado?: number, navegar: boolean = true) {
//         try {
//             console.log('[Caja] Iniciando creación de nueva caja...');

//             const nuevaCaja = new Cajas();

//             nuevaCaja.cerrada = false;

//             nuevaCaja.puntoVenta = this.puntoVenta;
//             nuevaCaja.fechaApertura = new Date();

//             // ✅ Usamos el monto forzado si viene del hijo, si no, 0 (por si se usa el botón "Abrir Caja")
//             nuevaCaja.montoInicial = montoInicialForzado ?? 0;

//             nuevaCaja.montoCierre = 0;
//             nuevaCaja.gastos = [];
//             nuevaCaja.datos = 0;
//             nuevaCaja.totales = {
//                 movimientos: 0, efectivo: 0, debito: 0, credito: 0,
//                 billetera: 0, transferencia: 0, cheque: 0, ctacte: 0
//             };
//             nuevaCaja.usuario = this.cuentaDatos?.usuario || 'Desconocido';

//             const idString = this.#idGenerator.generarId();
//             nuevaCaja.id = idString;

//             // 1. Guardar en IndexedDB
//             await firstValueFrom(this.#dbService.add('caja', nuevaCaja));

//             // 2. Notificar al gestor global
//             this.#cajaGestor.notificarCambioEnCaja();

//             // 3. Actualizar el estado reactivo local
//             this.cajaData.set({ ...nuevaCaja });
//             this.cajaIdActual.set(idString);

//             console.log(`[Caja] Nueva caja creada y abierta exitosamente con ID: ${idString}`);

//             console.log(`[Caja] Monto inicial  ${nuevaCaja}`);

//             // 4. Volver a la pantalla anterior (Listado de Cajas)
//             if (navegar) {
//                 this.#router.navigate(['/caja/listado']); // Ajusta '/cajas' a la ruta real de tu listado
//             }

//         } catch (error) {
//             console.error('[Caja] Error crítico al crear la caja:', error);
//         }
//     }

//     async guardarCambiosCaja() {
//         const cajaActual = this.cajaData();
//         if (cajaActual) {
//             try {
//                 await firstValueFrom(this.#dbService.update('caja', cajaActual));
//                 this.#cajaGestor.notificarCambioEnCaja();
//             } catch (error) {
//                 console.error('[Caja] Error al guardar cambios:', error);
//             }
//         }
//     }

//     actualizarCaja(nuevaCaja: Caja) {
//         this.cajaData.set({ ...nuevaCaja });
//         this.guardarCambiosCaja();
//     }


//     actualizarMontoCierre(nuevoMonto: number) {
//         const caja = this.cajaData();
//         if (caja) {
//             this.cajaData.set({ ...caja, montoCierre: nuevoMonto });
//             this.guardarCambiosCaja();
//         }
//     }

//     async cerrarCaja() {
//         const caja = this.cajaData();
//         if (caja) {
//             caja.cerrada = true;
//             caja.fechaCierre = new Date();
//             this.cajaData.set({ ...caja });
//             await this.guardarCambiosCaja();
//             this.#router.navigate(['/caja/listado']);
//         }
//     }

//     salir() {
//         // Lógica para volver al listado o cerrar el modal
//         console.log('[Caja] Saliendo de la vista de arqueo.');
//     }
// }
