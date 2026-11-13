import { USE_DEVICE_LANGUAGE } from '@angular/fire/compat/auth';
import { Component, Inject, ViewEncapsulation, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

//RXJS
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

//DIPS
import { DipsUsuarioService } from 'src/@dips/services/usuario.service';
import { DipsParametroService } from 'src/@dips/services/parametro/parametro.service';

// DB
import { HabitacionesDatabase } from 'src/app/firebase/datos/habitaciones';
import { TablaItemUnido } from 'src/app/firebase/servicios/firebase.model';
import { FireBDService } from 'src/app/firebase/servicios/firebase.service';
import { albergoParametro } from 'src/@dips/services/parametro/parametro.model';
import { MEDIOS_PAGO } from '../../caja/arqueo/arqueo.model';

@Component({
    selector: 'tablero-form-dialog',
    templateUrl: './tablero-form.component.html',
    styleUrls: ['./tablero-form.component.scss'],
    encapsulation: ViewEncapsulation.None
})

export class TableroFormDialogComponent implements OnInit, OnDestroy {
//    accion: string;

    dato: TablaItemUnido;
    habitacion: any;

    usuario: any
    parametros: any

    info: any = {
        precio: 0,
        pago: 0,
        periodo: 0,
    }


    datoForm!: FormGroup;
    dialogoTitulo!: string;
    botonAccion!: string
    listPromo: any = []
    readonly monedas = MEDIOS_PAGO;

    private _unsubscribeAll: Subject<any>;

    constructor(
        public matDialogRef: MatDialogRef<TableroFormDialogComponent>,
        @Inject(MAT_DIALOG_DATA) private _data: any,
        // private _formBuilder: FormBuilder,
        private _habitaDB: HabitacionesDatabase,
        private _dipsUsuarioService: DipsUsuarioService,
        // private _promoDB: PromocionesDatabase,
//        private _dipsParametrosService: DipsParametroService,
        private _fireService: FireBDService,

    ) {

        this.dato = _data.dato;

        this._dipsUsuarioService.getUsuario()
                .subscribe((usuario: any) => {

            console.log("USUARIO +++" , usuario)

            this.usuario = usuario

        })

         switch (this.dato.estado) {
            case 0:           // Mantenimiento
                this.dialogoTitulo = "Mantenimiento"
                this.botonAccion = "Salir de Mantenimiento"
                break;
            case 4:           // Vacia
                this.dialogoTitulo = "Disponible"
                break;
            case 1:           // Ocupada
                this.dialogoTitulo = "Ocupada"
                break;
            case 2:           // Sucia  
                this.dialogoTitulo = "Sucia"
                this.botonAccion = "Iniciar Limpieza"
                break;
            case 3:           // Limpieza
                this.dialogoTitulo = "Limpieza"
                this.botonAccion = "Limpieza Terminada"
                break;
                                                
            default:
                break;
        }

        this._unsubscribeAll = new Subject();

        // Lectura de Parametros
        this._fireService.leeParametros()
            ?.pipe(takeUntil(this._unsubscribeAll))
            .subscribe((parametro) => {
                console.log("LEE PARAMETROS", parametro)
                this.parametros = new albergoParametro(parametro);
   
        })
 
    }

    ngOnInit() {

        this.inicializaForm()

        // SOLO PARA OCUPADA O VACIA
        if (this.dato.estado == 4 ||      // vacia
            this.dato.estado == 1){       // ocupada

            // busca la habitacion para armar las posibles promos    
            this._habitaDB.busca(this.dato.id)
                .pipe(takeUntil(this._unsubscribeAll))
                .subscribe((res: any) => {

                    this.habitacion = res.payload.data()
                    this.creaForm() // llamados aqui por asincronismo

                })
        } else {
            this.creaForm()
        }    

    }

    ngOnDestroy() {
        // Unsubscribe from all subscriptions
        this._unsubscribeAll.next();
        this._unsubscribeAll.complete();
    }


    inicializaForm() {

        this.datoForm = new FormGroup({
            promoUID: new FormControl(),
            moneda: new FormControl('0', Validators.required),
        });

    }

    creaForm() {

        if(this.dato.estado == 4 ||       // vacia
           this.dato.estado == 1) {       // Ocupada
            
           this._armadoPromos()
        }

        if (this.datoForm) {
            this.datoForm.reset({ promoUID: this.dato.promoUID || null, moneda: '0' });
        }

        if(this.dato.estado == 4 ||       // vacia
           this.dato.estado == 1) {       // ocupada

            this._calculoImporte(this.dato.promoUID)                
        }    

        // Si el estado actual es MANTENIMIENTO solo puede suspender ese estado
        // un administrador
        if (this.dato.estado == 0 &&      // Mantenimiento
            !this.usuario.tipoAdmin) {
            alert("Esta función solo puede ser desactivada por el Administrador");
            this.matDialogRef.close(['cancel',this.datoForm])
        }

        if (this.dato.valor == 0) {
            alert("Esta habitación no tiene importe declarado.");
            this.matDialogRef.close(['cancel',this.datoForm])
        }


        this.pantalla();


    }

    pantalla() {

        if(this.dato.estado == 0 ||       // Mantenimiento
           this.dato.estado == 3 ||       // Limpieza
           this.dato.estado == 2) {       // Sucia

          //pantalla en cambio de estado
          document.getElementById('block-ocupacion')!.style.display = 'none';
          document.getElementById('block-etapa')!.style.display = 'block';
   
        } else {                    //ocupacion

          document.getElementById('block-etapa')!.style.display = 'none';
          document.getElementById('block-ocupacion')!.style.display = 'block';

        }
    
    }

    eventoPromo(evento: any) {

       this._calculoImporte(evento.value)

    }

    // =========================================================
    // * PROMOS  
    // =========================================================  

    private _armadoPromos() {

        // Armado de Listado de PROMOS
        this.listPromo = []     // limpia listado

        const sinValor = { uid: '0', nombre: "- sin Promo -" }
        this.listPromo.push(sinValor)   // primera promo SIN PROMO


        if (this.dato.estado == 4 ||  // Vacia
            this.dato.estado == 1){   // ocupada

            // filtro de dia y fecha
            let hoy = new Date();
            let filtro = hoy.getDay() + '-' + hoy.getHours()

            this.habitacion.promos.forEach((elemento: any) => {

                // si la promo esta activa
                if (elemento.activo) {
                    if (elemento.claves.includes(filtro)) { // esta en el filtro

                        this.listPromo.push(elemento)

                    }
                }

            })

        }    

    }  

    private _calculoImporte(promo: any = 0) {

        console.log("CALCULO DE IMPORTE", promo)

        if (promo != '0' && promo != undefined) {

            let encontrada = this.listPromo.find((elemento: any) => elemento.uid == promo);

            console.log("encontrada", encontrada)

            if (encontrada != undefined) {
                
                this.info.precio  = (encontrada.importe > 0)? encontrada.importe: this.dato.valor
                this.info.periodo = (encontrada.permanencia > 0)? encontrada.permanencia: this.parametros.tiempoStandard 

                this.datoForm.controls['promoUID'].setValue(encontrada.uid)

            } else {

                this.info.precio = this.dato.valor       
                this.info.periodo = this.parametros.tiempoStandard         
            }

        } else {
            
            this.info.precio = this.dato.valor;
            this.info.periodo = this.parametros.tiempoStandard 
        }

        // calculo del multipo para ajustar el precio
        if (this.dato.aviso == 3) {           // Gracia
            const hoy =  Math.floor(Date.now()) // hoy en segundos
            const multiplo = Math.floor(Math.floor((hoy - this.dato.horaInicio)) / (this.info.periodo * 60))

            this.info.precio *= multiplo + 1;

        }


        this._boton()

    }

    private _boton() {

        // Solo para estado Ocupado
        if (this.dato.estado == 1){

            const diferencia = Math.max(0, this.info.precio - this.dato.pagado)

            this.info.pago = diferencia

            console.log("boton", this.info.periodo)

 
            this.botonAccion = diferencia === 0
                ? 'CHECK OUT'
                : `COBRAR $${diferencia}`;
        }
    }

}
