// src/app/checkout/checkout.component.ts
import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MercadoPagoService } from '../services/mercado-pago.service';

interface Plan {
    id: string;
    name: string;
    monthlyPrice: number;
    discount6Months: number;
    discount12Months: number;
}

@Component({
    selector: 'app-checkout',
    standalone: true,
    imports: [CommonModule, FormsModule],
    template: `
    <div class="checkout">
      <h2>Elegí tu plan</h2>

      <div class="plans">
        @for (plan of plans(); track plan.id) {
          <div class="plan" [class.selected]="selectedPlan()?.id === plan.id"
               (click)="selectPlan(plan)">
            <h3>{{ plan.name }}</h3>
            <p class="price">\${{ plan.monthlyPrice }}/mes</p>
          </div>
        }
      </div>

      @if (selectedPlan(); as plan) {
        <div class="period">
          <h3>Período de pago</h3>
          @for (opt of periodOptions(plan); track opt.period) {
            <label>
              <input type="radio" [value]="opt.period"
                     [checked]="selectedPeriod() === opt.period"
                     (change)="selectedPeriod.set(opt.period)">
              {{ opt.label }} — \${{ opt.total }}
              @if (opt.savings > 0) {
                <span class="savings">Ahorrás \${{ opt.savings }}</span>
              }
            </label>
          }
        </div>

        <div class="discount">
          <h3>Código de descuento</h3>
          <input type="text" [(ngModel)]="discountCode" placeholder="Ej: PROMO15">
          @if (discountMessage()) {
            <p [class.error]="discountError()">{{ discountMessage() }}</p>
          }
        </div>

        <button (click)="pay()" [disabled]="loading()">
          {{ loading() ? 'Procesando...' : 'Pagar con Mercado Pago' }}
        </button>
      }
    </div>
  `,
    styles: [`
    .checkout { max-width: 800px; margin: 2rem auto; padding: 1rem; }
    .plans { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; }
    .plan { border: 2px solid #ddd; padding: 1rem; border-radius: 8px; cursor: pointer; }
    .plan.selected { border-color: #009ee3; background: #f0f9ff; }
    .price { font-size: 1.5rem; font-weight: bold; color: #009ee3; }
    .period label { display: block; padding: 0.5rem; cursor: pointer; }
    .savings { color: #28a745; margin-left: 0.5rem; font-size: 0.9rem; }
    .discount input { padding: 0.5rem; width: 200px; }
    .error { color: #dc3545; }
    button { background: #009ee3; color: white; padding: 1rem 2rem; border: none;
             border-radius: 6px; font-size: 1rem; cursor: pointer; margin-top: 1rem; }
    button:disabled { opacity: 0.6; }
  `]
})
export class CheckoutComponent {
    private mpService = inject(MercadoPagoService);

    plans = signal<Plan[]>([
        { id: 'basic', name: 'Básico', monthlyPrice: 9000, discount6Months: 0.10, discount12Months: 0.20 },
        { id: 'pro', name: 'Profesional', monthlyPrice: 15000, discount6Months: 0.10, discount12Months: 0.20 },
        { id: 'enterprise', name: 'Empresa', monthlyPrice: 25000, discount6Months: 0.15, discount12Months: 0.25 },
    ]);

    selectedPlan = signal<Plan | null>(null);
    selectedPeriod = signal<'monthly' | '6months' | '12months'>('monthly');
    discountCode = '';
    discountMessage = signal('');
    discountError = signal(false);
    loading = signal(false);

    selectPlan(plan: Plan) { this.selectedPlan.set(plan); }

    periodOptions(plan: Plan) {
        const base = plan.monthlyPrice;
        return [
            { period: 'monthly' as const, label: 'Mensual', total: base, savings: 0 },
            {
                period: '6months' as const, label: '6 meses',
                total: Math.round(base * 6 * (1 - plan.discount6Months)),
                savings: Math.round(base * 6 * plan.discount6Months)
            },
            {
                period: '12months' as const, label: '12 meses',
                total: Math.round(base * 12 * (1 - plan.discount12Months)),
                savings: Math.round(base * 12 * plan.discount12Months)
            },
        ];
    }

    async pay() {
        const plan = this.selectedPlan();
        if (!plan) return;
        this.loading.set(true);
        try {
            const res = await this.mpService.createCheckout({
                planId: plan.id,
                period: this.selectedPeriod(),
                discountCode: this.discountCode || undefined,
            }).toPromise();
            if (res?.initPoint) window.location.href = res.initPoint;
        } catch (err: any) {
            this.discountError.set(true);
            this.discountMessage.set(err.message || 'Error al procesar el pago');
        } finally {
            this.loading.set(false);
        }
    }
}