//  common/pdf/dato-PDF/datoPDF.service.ts
import { Injectable } from '@angular/core';
import { Observable, forkJoin, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

@Injectable({
    providedIn: 'root'
})
export class DatoPDFService {

    constructor() { }

    /**
     * Combina datos de diferentes servicios para crear la estructura de datos
     * que alimentará al servicio de generación de PDFs
     * @param dataSources Array de observables que devuelven los datos de cada fuente
     * @param transformations Funciones de transformación para mapear los datos
     * @returns Observable con la estructura de datos para el PDF
     */
    combinarDatosParaPDF(
        dataSources: Observable<any>[],
        transformations?: ((data: any, index: number) => any)[]
    ): Observable<any> {

        if (dataSources.length === 0) {
            return of({});
        }

        return forkJoin(dataSources).pipe(
            map(results => {
                let combinedData: any = {};

                results.forEach((result, index) => {
                    let transformedData = result;

                    // Aplicar transformaciones si se proporcionan
                    if (transformations && transformations[index]) {
                        transformedData = transformations[index](result, index);
                    }

                    // Combinar los datos transformados
                    const formattedData = this._transformarAFormatoAnidado(transformedData, `fuente_${index}`);
                    combinedData = { ...combinedData, ...formattedData };
                });

                return combinedData;
            }),
            catchError(error => {
                console.error('Error combinando datos para PDF:', error);
                return of({});
            })
        );
    }

    /**
     * Transforma datos planos en una estructura con arrays y objetos anidados
     */
    private _transformarAFormatoAnidado(data: any, prefix: string = ''): any {
        if (Array.isArray(data)) {
            // Si es un array, lo mantiene como array
            return { [prefix]: data };
        } else if (typeof data === 'object' && data !== null && !(data instanceof Date)) {
            // Si es un objeto, lo mantiene como objeto
            if (prefix) {
                return { [prefix]: data };
            } else {
                return data;
            }
        } else {
            // Valor primitivo
            if (prefix) {
                return { [prefix]: data };
            } else {
                return data;
            }
        }
    }

    /**
     * Ejemplo específico para la lista de precios
     * Combina productos en un array dentro de la estructura
     */
    generarDatosListaPrecios(productos: any[]): any {
        return {
            'titulo': 'Lista de Precios',
            'fecha_generacion': new Date().toLocaleDateString(),
            'cantidad_productos': productos.length,
            'productos': productos.map((producto, index) => ({
                nombre: producto.nombre,
                sku: producto.sku,
                precioPublico: producto.precioPublico,
                descripcion: producto.descripcion || ''
            }))
        };
    }

    /**
     * Ejemplo específico para facturas
     * Combina datos en una estructura con arrays y objetos anidados
     */
    generarDatosFactura(
        cliente: any,
        empresa: any,
        items: any[],
        encabezado: any = {}
    ): any {
        const totalFactura = items?.reduce((sum, item) => sum + (item.precio || 0) * (item.cantidad || 1), 0) || 0;

        return {
            factura: {
                ...encabezado,
                total_factura: totalFactura
            },
            cliente: cliente || {},
            empresa: empresa || {},
            items: items?.map(item => ({
                nombre: item.nombre,
                cantidad: item.cantidad,
                precio: item.precio
            })) || [],
            total_items: items?.length || 0
        };
    }

    /**
     * Método para combinar múltiples fuentes de datos en una estructura completa
     */
    generarEstructuraCompleta(datos: {
        productos?: any[],
        cliente?: any,
        empresa?: any,
        items?: any[],
        encabezado?: any,
        otrosDatos?: any
    }): any {
        const estructura: any = {};

        // Datos fijos
        if (datos.productos) {
            estructura.titulo = 'Lista de Precios';
            estructura.fecha_generacion = new Date().toLocaleDateString();
            estructura.cantidad_productos = datos.productos.length;
            estructura.productos = datos.productos.map((producto, index) => ({
                nombre: producto.nombre,
                sku: producto.sku,
                precio: producto.precio,
                descripcion: producto.descripcion || ''
            }));
        }

        // Datos de factura si se proporcionan
        if (datos.cliente || datos.empresa || datos.items) {
            estructura.factura = {
                ...datos.encabezado,
                total_factura: datos.items?.reduce((sum, item) => sum + (item.precio || 0) * (item.cantidad || 1), 0) || 0
            };
            if (datos.cliente) estructura.cliente = datos.cliente;
            if (datos.empresa) estructura.empresa = datos.empresa;
            if (datos.items) {
                estructura.items = datos.items.map(item => ({
                    nombre: item.nombre,
                    cantidad: item.cantidad,
                    precio: item.precio
                }));
                estructura.total_items = datos.items.length;
            }
        }

        // Otros datos fijos
        if (datos.otrosDatos) {
            Object.assign(estructura, datos.otrosDatos);
        }

        return estructura;
    }
}

