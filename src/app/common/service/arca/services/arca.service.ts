// arca.service.ts
import { HttpClient } from '@angular/common/http';
import { inject, Injectable, PLATFORM_ID } from '@angular/core';
import {
  ArcaCredenciales,
  ArcaResponse,
  FacturaElectronica,
  // SolicitudConsultaPadronA13,
  // DatosFiscales
} from '@cf/factura/arca/modelos';

import { Observable } from 'rxjs';
import { environment } from '@base/src/environments/environment';
import { isPlatformBrowser } from '@angular/common';
import { AnyKindOfDictionary } from 'lodash';

// Interfaz local
interface ArcaRequest {
  credentials: ArcaCredenciales;
  demo?: boolean;
  factura: FacturaElectronica;
}

@Injectable({
  providedIn: 'root',
})
export class ArcaService {
  private _demo: boolean = false;
  private _platformId = inject(PLATFORM_ID);
  private _functionUrl: string = '';


  constructor(private _http: HttpClient) {
    this._demo = !environment.production;

    if (this._demo && isPlatformBrowser(this._platformId)) {
      console.log('🔧 Modo demo: usando emulador local');
    }

    this._functionUrl = this._demo
      ? 'http://localhost:5001/gessi-dips/us-central1'
      : 'https://us-central1-gessi-dips.cloudfunctions.net';

  }

  enviarFactura(
    credenciales: ArcaCredenciales,
    factura: FacturaElectronica
  ): Observable<ArcaResponse> {
    const functionUrl = this._demo
      ? 'http://localhost:5001/gessi-dips/us-central1/emiteFactura'
      : 'https://us-central1-gessi-dips.cloudfunctions.net/emiteFactura';

    const demo = this._demo;

    const body = { credenciales, factura, demo };

    return this._http.post<ArcaResponse>(functionUrl, body);
  }

  async generarQRParaPDF(
    credenciales: ArcaCredenciales,
    factura: FacturaElectronica,
    numero: number,
    cae: string
  ): Promise<{ qrBase64?: string; qrUrl?: string }> {

    try {
      // Preparar payload según formato esperado por Cloud Function
      const qrPayload = {
        credenciales: {
          certUrl: credenciales.certUrl,
          keyUrl: credenciales.keyUrl,
          cuit: credenciales.cuit,
          puntoVenta: credenciales.puntoVenta,
          pathCuenta: credenciales.pathCuenta
        },
        factura: {
          puntoVenta: factura.puntoVenta,
          tipoComprobante: factura.tipoComprobante,
          numeroComprobante: numero,
          fecha: factura.cbteFecha,           // Formato AAAAMMDD
          importeTotal: factura.impTotal,
          cuilEmisor: credenciales.cuit,
          tipoDocumentoReceptor: factura.tipoDocumento,
          numeroDocumentoReceptor: factura.nroDocumento,
          cae: cae,
          guardarEnStorage: false
        },
        returnFormat: 'base64'  // Para incrustar directamente en PDF
      };

      // Construir URL de la Cloud Function
      const functionName = 'generaQRFactura';
      const functionUrl = this._demo
        ? `http://localhost:5001/gessi-dips/us-central1/${functionName}`
        : `https://us-central1-gessi-dips.cloudfunctions.net/${functionName}`;


      const response = await fetch(functionUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(qrPayload)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Error HTTP ${response.status}`);
      }

      const qrResult = await response.json();

      if (!qrResult.success) {
        throw new Error(qrResult.message || 'Error al generar QR');
      }

      console.log('[QR] Generado exitosamente:', {
        cae: qrResult.cae,
        hasBase64: !!qrResult.qrBase64,
        hasUrl: !!qrResult.qrUrl
      });

      return {
        qrBase64: qrResult.qrBase64,
        qrUrl: qrResult.qrUrl
      };

    } catch (error) {
      console.error('[QR] Error generando código QR:', error);
      // Retornamos vacío para no bloquear el flujo de impresión
      return { qrBase64: undefined, qrUrl: undefined };
    }
  }


}