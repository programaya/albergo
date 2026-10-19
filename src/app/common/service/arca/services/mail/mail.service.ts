import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { ArcaError } from '@cf/factura/arca/errores';

/**
 * Datos para enviar un email
 */
export interface EmailData {
    destinatario: string;
    nombreUsuario: string;
    nombreEmpresa: string;
    enlace: string;
    asunto?: string;
}

/**
 * Respuesta del servicio de email
 */
export interface EmailResponse {
    success: boolean;
    error?: string;
    details?: string;
}

@Injectable({
    providedIn: 'root'
})
export class MailService {
    private readonly API_URL = '/api/mail/enviar'; // Ajustar según tu configuración

    constructor(private http: HttpClient) { }

    /**
     * Envía un email de invitación
     * @param data Datos del email
     * @returns Observable con la respuesta
     */
    enviarInvitacion(data: EmailData): Observable<EmailResponse> {
        return this.http.post<EmailResponse>(this.API_URL, data).pipe(
            map(response => {
                if (response.success) {
                    return response;
                } else {
                    throw new ArcaError(
                        response.error || 'Error al enviar email',
                        'EMAIL_ENVIO_ERROR',
                        response.details || 'Respuesta sin datos'
                    );
                }
            }),
            catchError(this.handleError)
        );
    }

    /**
     * Manejador de errores
     */
    private handleError(error: HttpErrorResponse | any): Observable<never> {
        let errorMessage = 'Error desconocido';

        if (error instanceof ArcaError) {
            errorMessage = error.message;
        } else if (error.error instanceof ErrorEvent) {
            errorMessage = `Error: ${error.error.message}`;
        } else if (error.error?.error) {
            errorMessage = error.error.error;
            if (error.error.details) {
                errorMessage += ` - ${error.error.details}`;
            }
        } else if (error.message) {
            errorMessage = error.message;
        }

        console.error('Error en MailService:', errorMessage, error);
        return throwError(() => new Error(errorMessage));
    }

    /**
     * Valida formato de email
     */
    validarEmail(email: string): boolean {
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return regex.test(email);
    }

    /**
     * Formatea nombre de usuario (primera letra mayúscula)
     */
    formatearNombre(nombre: string): string {
        if (!nombre) return '';
        return nombre.charAt(0).toUpperCase() + nombre.slice(1).toLowerCase();
    }
}