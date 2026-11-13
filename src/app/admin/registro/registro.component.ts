import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { PageEvent } from '@angular/material/paginator';
import { Sort } from '@angular/material/sort';
import { Subject, of } from 'rxjs';
import { catchError, switchMap, takeUntil } from 'rxjs/operators';
import { DipsUsuarioService } from 'src/@dips/services/usuario.service';
import { ArqueoDatabase } from '../../principal/caja/arqueo/arqueo.database';
import { Caja, MEDIOS_PAGO } from '../../principal/caja/arqueo/arqueo.model';
import { DetalleArqueoComponent } from '../../principal/caja/arqueo/detalle-arqueo/detalle-arqueo.component';

@Component({
  selector: 'app-registro',
  templateUrl: './registro.component.html',
  styleUrls: ['./registro.component.scss']
})
export class RegistroComponent implements OnInit, OnDestroy {
  cajas: Caja[] = [];
  busqueda = '';
  cargando = true;
  error = '';
  pagina = 0;
  tamanioPagina = 15;
  orden: Sort = { active: 'fechaCierre', direction: 'desc' };
  private destruir = new Subject<void>();

  constructor(private usuarios: DipsUsuarioService, private database: ArqueoDatabase,
    private dialog: MatDialog) { }

  ngOnInit(): void {
    this.usuarios.getUsuario().pipe(
      switchMap(usuario => {
        this.cajas = [];
        this.error = '';
        this.cargando = !!usuario?.idCuenta;
        if (!usuario?.idCuenta) return of([] as Caja[]);
        return this.database.cierres(usuario.idCuenta).pipe(catchError(() => {
          this.error = 'No se pudieron cargar los cierres de caja.';
          return of([] as Caja[]);
        }));
      }), takeUntil(this.destruir)
    ).subscribe(cajas => {
      this.cajas = cajas.sort((a, b) => (this.fecha(b.fechaCierre)?.getTime() || 0) -
        (this.fecha(a.fechaCierre)?.getTime() || 0));
      this.pagina = 0;
      this.cargando = false;
    });
  }

  get filtradas(): Caja[] {
    const texto = this.busqueda.trim().toLocaleLowerCase('es-AR');
    return this.cajas.filter(caja => [caja.id, caja.usuario,
      this.fecha(caja.fechaApertura)?.toLocaleString('es-AR'),
      this.fecha(caja.fechaCierre)?.toLocaleString('es-AR')]
      .join(' ').toLocaleLowerCase('es-AR').includes(texto));
  }

  get visibles(): Caja[] {
    const ordenadas = this.filtradas;
    if (this.orden.direction) {
      ordenadas.sort((a, b) => {
        const primero = this.valorOrden(a);
        const segundo = this.valorOrden(b);
        const comparacion = typeof primero === 'string' && typeof segundo === 'string'
          ? primero.localeCompare(segundo, 'es-AR', { sensitivity: 'base', numeric: true })
          : (primero < segundo ? -1 : primero > segundo ? 1 : 0);
        return comparacion * (this.orden.direction === 'asc' ? 1 : -1);
      });
    }
    return ordenadas.slice(this.pagina * this.tamanioPagina, (this.pagina + 1) * this.tamanioPagina);
  }

  ordenar(orden: Sort): void {
    this.orden = orden;
    this.pagina = 0;
  }

  private valorOrden(caja: Caja): string | number {
    switch (this.orden.active) {
      case 'fechaApertura': return this.fecha(caja.fechaApertura)?.getTime() || 0;
      case 'fechaCierre': return this.fecha(caja.fechaCierre)?.getTime() || 0;
      case 'usuario': return caja.usuario || '';
      case 'montoInicial': return Number(caja.montoInicial) || 0;
      case 'ingresos': return this.ingresos(caja);
      case 'montoCierre': return Number(caja.montoCierre) || 0;
      default: return 0;
    }
  }

  cambiarPagina(evento: PageEvent): void {
    this.pagina = evento.pageIndex;
    this.tamanioPagina = evento.pageSize;
  }

  fecha(valor: any): Date | null {
    if (!valor) return null;
    const fecha = valor.toDate ? valor.toDate() : new Date(valor);
    return Number.isNaN(fecha.getTime()) ? null : fecha;
  }

  ingresos(caja: Caja): number {
    return MEDIOS_PAGO.reduce((total, medio) => total + Number(caja.totales?.[medio.clave] || 0), 0);
  }

  explorar(caja: Caja): void {
    this.dialog.open(DetalleArqueoComponent, {
      width: '1200px', maxWidth: '95vw', maxHeight: '95vh', autoFocus: false, data: caja
    });
  }

  ngOnDestroy(): void {
    this.destruir.next();
    this.destruir.complete();
  }
}
