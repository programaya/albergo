// src/app/services/mercado-pago.service.ts
import { Injectable, inject } from '@angular/core';
import { httpsCallable, Functions } from '@angular/fire/functions';
import { Observable, from } from 'rxjs';

export interface CheckoutRequest {
    planId: string;
    period: 'monthly' | '6months' | '12months';
    discountCode?: string;
}

export interface CheckoutResponse {
    initPoint: string;
    subscriptionId: string;
}

@Injectable({ providedIn: 'root' })
export class MercadoPagoService {
    private functions = inject(Functions);

    createCheckout(data: CheckoutRequest): Observable<CheckoutResponse> {
        const fn = httpsCallable<CheckoutRequest, CheckoutResponse>(
            this.functions, 'createCheckout'
        );
        return from(fn(data).then(r => r.data));
    }
}