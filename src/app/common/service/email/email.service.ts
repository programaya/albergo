import { HttpClient } from '@angular/common/http';
import { inject, Injectable, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Observable } from 'rxjs';
import { environment } from '@base/src/environments/environment';

export interface EmailInvitation {
  destinatario: string;
  nombreUsuario: string;
  nombreEmpresa: string;
  idCuenta: string;
  token: string;
}

export interface DatoEmail {
  destinatario: string;
  nombreUsuario: string;
  nombreEmpresa: string;
  enlace: string;
}

@Injectable({
  providedIn: 'root',
})
export class EmailService {
  private readonly _platformId = inject(PLATFORM_ID);
  private readonly _http = inject(HttpClient);
  private readonly _isDemo = !environment.production;
  private readonly _baseUrl: string;
  private readonly _urlEnlace: string

  constructor() {
    this._baseUrl = this._isDemo
      ? 'http://localhost:5001/gessi-dips/us-central1'
      : 'https://us-central1-gessi-dips.cloudfunctions.net';

    this._urlEnlace = this._isDemo
      ? 'http://localhost:4200/invitacion'
      : 'https://gessi-dips.web.app/invitacion';  

    if (this._isDemo && isPlatformBrowser(this._platformId)) {
      console.log('📧 Modo demo: usando emulador local para enviarEmail');
    }
  }

  enviarInvitacion(invitation: EmailInvitation): Observable<{ success: boolean }> {
    const url = `${this._baseUrl}/enviarEmail`;
    const datoEmail: DatoEmail = {
      destinatario: invitation.destinatario,
      nombreUsuario: invitation.nombreUsuario,
      nombreEmpresa: invitation.nombreEmpresa,
      enlace: `${this._urlEnlace}/${invitation.idCuenta}/${invitation.token}`
    };
    return this._http.post<{ success: boolean }>(url, datoEmail);

  }
}