import { Injectable } from '@angular/core';

/**
 * Servicio para generar identificadores únicos en formato string.
 * Utiliza crypto.randomUUID() como método principal (nativo del navegador)
 * y cuenta con un fallback para entornos donde no esté disponible.
 */
@Injectable({
    providedIn: 'root' // Disponible en toda la aplicación sin necesidad de registrarlo en módulos
})
export class IdGeneratorService {

    /**
     * Genera un identificador único en formato string.
     *
     * @returns Un string único (UUID v4 o fallback basado en timestamp + random)
     *
     * @example
     * const nuevoId = this.idGenerator.generarId();
     * // Resultado: "550e8400-e29b-41d4-a716-446655440000"
     */
    generarId(): string {
        // Método principal: usa la API nativa del navegador (UUID v4)
        if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
            return crypto.randomUUID();
        }

        // Fallback: combinación de timestamp + caracteres aleatorios
        return this._generarIdFallback();
    }

    /**
     * Genera un ID corto (más compacto que un UUID completo).
     * Útil cuando no se necesita la longitud completa de un UUID.
     *
     * @param longitud Longitud aproximada del ID (por defecto 16 caracteres)
     * @returns Un string alfanumérico único
     */
    generarIdCorto(longitud: number = 16): string {
        const caracteres = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let resultado = '';

        // Usamos timestamp como base para mayor unicidad
        resultado += Date.now().toString(36);

        // Completamos con caracteres aleatorios hasta alcanzar la longitud deseada
        while (resultado.length < longitud) {
            resultado += caracteres.charAt(Math.floor(Math.random() * caracteres.length));
        }

        return resultado.substring(0, longitud);
    }

    /**
     * Método fallback para generar IDs cuando crypto.randomUUID no está disponible.
     */
    private _generarIdFallback(): string {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
            const r = (Math.random() * 16) | 0;
            const v = c === 'x' ? r : (r & 0x3) | 0x8;
            return v.toString(16);
        });
    }
}