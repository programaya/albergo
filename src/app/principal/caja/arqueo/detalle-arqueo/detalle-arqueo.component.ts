import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Caja, MEDIOS_PAGO } from '../arqueo.model';

@Component({
  selector: 'app-detalle-arqueo',
  templateUrl: './detalle-arqueo.component.html',
  styleUrls: ['./detalle-arqueo.component.scss']
})
export class DetalleArqueoComponent {
  readonly encabezados = ['Fecha de ingreso', 'Fecha de egreso', 'Concepto', 'Tipo', 'Importe', 'Usuario', 'Medio / operación'];
  readonly resumen: string[][];
  readonly movimientos: string[][];

  constructor(@Inject(MAT_DIALOG_DATA) public caja: Caja) {
    this.resumen = [
      ['ID de caja', caja.id], ['Estado', caja.cerrada ? 'Cerrada' : 'Abierta'],
      ['Punto de venta', caja.puntoVenta], ['Usuario', caja.usuario],
      ['Fecha de apertura', this.fecha(caja.fechaApertura)], ['Fecha de cierre', this.fecha(caja.fechaCierre)],
      ['Monto inicial', this.importe(caja.montoInicial)], ['Monto de cierre', this.importe(caja.montoCierre)],
      ['Datos', String(caja.datos)],
      ...MEDIOS_PAGO.map(medio => [medio.nombre, this.importe(caja.totales?.[medio.clave])]),
      ['Cantidad de movimientos contabilizados', String(caja.totales?.movimientos || 0)]
    ];
    this.movimientos = (caja.movimientos || []).map(m => [
      this.fecha(m.fechaInicio), this.fecha(m.fechaFin), m.descripcion, m.tipo,
      this.importe(m.monto), m.usuario,
      MEDIOS_PAGO.find(medio => medio.codigo === m.datos?.charAt(0))?.nombre ||
        (({ '7': 'Ajuste', '8': 'Gasto', '9': 'Apertura', 'A': 'Cierre' } as Record<string, string>)[m.datos] || 'Sin especificar')
    ]);
  }

  private fecha(valor: any): string {
    if (valor == null) return '—';
    const fecha = valor.toDate ? valor.toDate() : new Date(valor);
    return Number.isNaN(fecha.getTime()) ? '—' : fecha.toLocaleString('es-AR');
  }

  private importe(valor: number): string {
    return Number(valor || 0).toFixed(2);
  }

  exportarCsv(): void {
    const filas = [['Detalle de arqueo'], ...this.resumen, [], this.encabezados, ...this.movimientos];
    const csv = filas.map(fila => fila.map(valor => {
      let texto = String(valor ?? '');
      // Evita que los datos de texto se interpreten como fórmulas en una planilla.
      if (/^[=+@\-\t\r]/.test(texto) && !/^-?\d+(\.\d+)?$/.test(texto)) texto = "'" + texto;
      return '"' + texto.replace(/"/g, '""') + '"';
    }).join(';')).join('\r\n');
    const url = URL.createObjectURL(new Blob(['\ufeff', csv], { type: 'text/csv;charset=utf-8' }));
    const enlace = document.createElement('a');
    enlace.href = url;
    enlace.download = 'arqueo-' + (this.caja.id || 'detalle').replace(/[^a-zA-Z0-9_-]/g, '_') + '.csv';
    enlace.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  get resumenVisible(): string[][] {
    return this.resumen.filter(([campo]) =>
      !['ID de caja', 'Estado', 'Datos', 'Punto de venta'].includes(campo));
  }

  imprimir(): void {
    const marco = document.createElement('iframe');
    marco.style.cssText = 'position:fixed;width:0;height:0;border:0';
    const escapar = (valor: string) => String(valor ?? '').replace(/[&<>"']/g, caracter =>
      ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' } as Record<string, string>)[caracter]);
    const fila = (valores: string[], etiqueta = 'td') => '<tr>' + valores.map(valor =>
      `<${etiqueta}>${escapar(valor)}</${etiqueta}>`).join('') + '</tr>';
    marco.onload = () => {
      const ventana = marco.contentWindow;
      if (!ventana) { marco.remove(); return; }
      ventana.addEventListener('afterprint', () => marco.remove(), { once: true });
      ventana.focus();
      ventana.print();
    };
    marco.srcdoc = `<!doctype html><html lang="es"><head><meta charset="utf-8"><title>Albergo - Detalle de arqueo</title>
      <style>@page{size:A4 landscape;margin:12mm}body{font:11px Arial;color:#222}table{width:100%;border-collapse:collapse;margin-bottom:20px}th,td{border:1px solid #bbb;padding:6px;text-align:left;overflow-wrap:anywhere}thead{display:table-header-group}tr{break-inside:avoid}h1{font-size:20px}</style>
      </head><body><h1>Albergo</h1><h2>Detalle de arqueo de caja</h2><table><tbody>${this.resumenVisible.map(valores => fila(valores)).join('')}</tbody></table>
      <h2>Movimientos (${this.movimientos.length})</h2><table><thead>${fila(this.encabezados, 'th')}</thead><tbody>${this.movimientos.map(valores => fila(valores)).join('')}</tbody></table></body></html>`;
    document.body.appendChild(marco);
  }
}
