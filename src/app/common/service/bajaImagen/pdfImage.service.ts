// services/bajaImagen/pdfImage.service.ts

import { inject, Injectable, PLATFORM_ID } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom, finalize } from 'rxjs'; // 👈 Agregar finalize
import { environment } from '@envs/environment';
import { isPlatformBrowser } from '@angular/common';

export interface ImagePDFResponse {
    success: boolean;
    base64?: string;
    contentType?: string;
    size?: number;
    error?: string;
    message?: string;
}

@Injectable({ providedIn: 'root' })
export class PdfImageService {

    private _demo = !environment.production;
    private _functionUrl: string = '';
    private _platformId = inject(PLATFORM_ID);
    private cache = new Map<string, Promise<ImagePDFResponse>>();

    constructor(private http: HttpClient) {
        if (this._demo && isPlatformBrowser(this._platformId)) {
            console.log('🔧 Modo demo: usando emulador local');
        }

        this._functionUrl = this._demo
            ? 'http://localhost:5001/gessi-dips/us-central1'
            : 'https://us-central1-gessi-dips.cloudfunctions.net';

        this._functionUrl = `${this._functionUrl}/getImageForPDF`;
    }

    async getImageForPDF(imageUrl: string, userToken?: string): Promise<Uint8Array> {
        const cacheKey = `${imageUrl}_${userToken || 'anon'}`;

        // 1. Si ya existe en cache, reutilizar la Promise pendiente
        const cached = this.cache.get(cacheKey);
        if (cached) {
            const response = await cached;
            return this._processResponse(response);
        }

        // 2. Crear nueva petición HTTP (Observable)
        const request$ = this.http.post<ImagePDFResponse>(
            this._functionUrl,
            { imageUrl, uid: userToken },
            { headers: { 'Content-Type': 'application/json' } }
        );

        // 3. Convertir a Promise Y agregar limpieza de cache con finalize
        const requestPromise = firstValueFrom(
            request$.pipe(
                finalize(() => {
                    // Limpiar cache después de 30s para permitir reintentos si falla
                    setTimeout(() => this.cache.delete(cacheKey), 30000);
                })
            )
        );

        // 4. Guardar en cache ANTES de await para evitar llamadas duplicadas
        this.cache.set(cacheKey, requestPromise);

        const response = await requestPromise;
        return this._processResponse(response);
    }

    /**
     * Helper para procesar y validar la respuesta
     */
    private _processResponse(response: ImagePDFResponse): Uint8Array {
        if (!response.success || !response.base64) {
            throw new Error(response.error || 'Error al obtener la imagen');
        }

        // Manejar base64 con o sin prefijo data:image/...
        const base64Data = response.base64.includes(',')
            ? response.base64.split(',')[1]
            : response.base64;

        return Uint8Array.from(atob(base64Data), c => c.charCodeAt(0));
    }

    clearCache(): void {
        this.cache.clear();
    }
}