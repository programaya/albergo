// src/app/services/qr.service.ts
import { Injectable } from '@angular/core';
import * as QRCode from 'qrcode';

export interface QrAfipPayload {
    ver: number;
    fecha: string;
    cuit: number;
    ptoVta: number;
    tipoCmp: number;
    nroCmp: number;
    importe: number;
    moneda: string;
    ctz: number;
    tipoDocRec?: number;
    nroDocRec?: number;
    tipoCodAut: string;
    codAut: number;
}

@Injectable({
    providedIn: 'root'
})
export class QrService {

    private readonly AFIP_QR_BASE_URL = 'https://www.arca.gob.ar/fe/qr/?p=';

    /**
     * Genera el string URL completo para el QR
     */
    construirUrlQr(datos: QrAfipPayload): string {
        // 1. Convertir objeto a JSON
        const jsonString = JSON.stringify(datos);

        // 2. Codificar a Base64 (Manejo seguro de caracteres UTF-8)
        // AFIP requiere que el JSON esté codificado en Base64 URL-Safe
        const base64Data = btoa(unescape(encodeURIComponent(jsonString)));

        // 3. Unir con la base URL
        return `${this.AFIP_QR_BASE_URL}${base64Data}`;
    }

    /**
     * Genera la imagen del QR en formato DataURL (base64 image)
     * @param url La URL completa generada por construirUrlQr
     * @param size Tamaño en píxeles (recomendado 300 para buena calidad en PDF)
     */
    async generarImagenQr(url: string, size: number = 300): Promise<string> {
        try {
            const qrImageData = await QRCode.toDataURL(url, {
                width: size,
                margin: 2,
                color: {
                    dark: '#000000',
                    light: '#FFFFFF'
                },
                errorCorrectionLevel: 'M' // Nivel de corrección medio
            });
            return qrImageData;
        } catch (error) {
            console.error('Error generando QR:', error);
            throw new Error('No se pudo generar el código QR');
        }
    }

    /**
     * Método fachada: Recibe los datos de la factura y devuelve la imagen lista
     */
    async procesarQrFactura(datosPayload: QrAfipPayload): Promise<string> {
        const url = this.construirUrlQr(datosPayload);
        return await this.generarImagenQr(url);
    }
}