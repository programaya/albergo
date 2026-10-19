// src/app/checkout/success.component.ts
import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Firestore, doc, getDoc } from '@angular/fire/firestore';
import { Auth, user } from '@angular/fire/auth';

@Component({
    selector: 'app-checkout-success',
    standalone: true,
    template: `
    <div class="result">
      @if (status() === 'active') {
        <h1>¡Pago confirmado!</h1>
        <p>Tu suscripción está activa hasta el {{ expiresAt() | date:'dd/MM/yyyy' }}.</p>
      } @else {
        <h1>Procesando pago...</h1>
        <p>Estamos confirmando tu pago. Te avisaremos por email.</p>
      }
    </div>
  `
})
export class CheckoutSuccessComponent implements OnInit {
    private route = inject(ActivatedRoute);
    private fs = inject(Firestore);
    private auth = inject(Auth);
    status = signal<string>('pending');
    expiresAt = signal<Date | null>(null);

    ngOnInit() {
        user(this.auth).subscribe(async u => {
            if (!u) return;
            // Buscar la suscripción activa del usuario
            // (en producción usar una query con índice compuesto)
            const accSnap = await getDoc(doc(this.fs, 'accounts', u.uid));
            const subId = accSnap.data()?.['subscriptionId'];
            if (subId) {
                const subSnap = await getDoc(doc(this.fs, 'subscriptions', subId));
                const data = subSnap.data();
                this.status.set(data?.['status'] || 'pending');
                this.expiresAt.set(data?.['expiresAt']?.toDate() || null);
            }
        });
    }
}