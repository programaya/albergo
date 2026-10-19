# Integración Mercado Pago con Angular + Firebase

Te propongo una arquitectura completa dividida en 4 capas: **modelo de datos**, **Cloud Functions (backend)**, **servicio Angular** y **componente de checkout**.

---

## 1. Arquitectura general

```
┌─────────────────┐         ┌──────────────────────┐        ┌──────────────────┐
│  Angular App    │ ──HTTPS──▶│  Cloud Functions     │ ──API──▶│  Mercado Pago    │
│  (Checkout UI)  │◀─────────│  (Node.js / TS)      │◀─webhook─│  (Argentina)     │
└─────────────────┘         └──────────┬───────────┘        └──────────────────┘
                                       │
                                       ▼
                              ┌──────────────────┐
                              │   Firestore      │
                              │  (planes, subs)  │
                              └──────────────────┘
```

**Flujo:**
1. El usuario elige plan + período + código de descuento.
2. Angular llama a una Cloud Function → crea preferencia/preapproval en MP.
3. MP devuelve URL de checkout → redirige al usuario.
4. MP notifica vía webhook a otra Cloud Function → actualiza Firestore.

---

## 2. Modelo de datos en Firestore

```
plans/{planId}
  name: "Profesional"
  monthlyPrice: 15000        // ARS
  features: [...]
  discount6Months: 0.10      // 10%
  discount12Months: 0.20     // 20%

discountCodes/{code}
  percentage: 15
  validUntil: timestamp
  maxUses: 100
  usedCount: 0
  active: true

accounts/{accountId}
  email, name, ...
  subscriptionId: "sub_xxx"  // referencia a subscriptions/

subscriptions/{subscriptionId}
  accountId
  planId
  period: "monthly" | "6months" | "12months"
  status: "pending" | "active" | "paused" | "cancelled"
  mpPreapprovalId: "preapproval_xxx"
  discountCodeApplied: null | "CODE15"
  finalAmount: 12750
  startDate: timestamp
  nextBillingDate: timestamp
  expiresAt: timestamp | null

payments/{paymentId}
  subscriptionId
  mpPaymentId
  amount
  status: "approved" | "rejected" | "pending"
  createdAt
```

---

## 3. Cloud Functions (backend)

### 3.1. Instalación de dependencias

```bash
cd functions
npm install mercadopago firebase-admin firebase-functions
npm install -D typescript @types/node
```

### 3.2. `functions/src/config/mp.ts` — Configuración Mercado Pago

```typescript
import * as admin from "firebase-admin";
import MercadoPagoConfig, { PreApprovalClient, PreferenceClient } from "mercadopago";

admin.initializeApp();

const MP_ACCESS_TOKEN = process.env.MP_ACCESS_TOKEN!;

export const mpClient = new MercadoPagoConfig({ accessToken: MP_ACCESS_TOKEN });
export const preApprovalClient = new PreApprovalClient(mpClient);
export const preferenceClient = new PreferenceClient(mpClient);

export const APP_URL = process.env.APP_URL || "https://tu-app.com";
export const WEBHOOK_SECRET = process.env.MP_WEBHOOK_SECRET!;
```

### 3.3. `functions/src/utils/pricing.ts` — Cálculo de precios

```typescript
import * as admin from "firebase-admin";

export interface PricingResult {
  baseAmount: number;
  discountPeriod: number;
  discountCode: number;
  finalAmount: number;
  months: number;
}

export async function calculatePrice(
  planId: string,
  period: "monthly" | "6months" | "12months",
  discountCode?: string
): Promise<PricingResult> {
  const planSnap = await admin.firestore().collection("plans").doc(planId).get();
  if (!planSnap.exists) throw new Error("Plan no encontrado");
  const plan = planSnap.data()!;

  const months = period === "monthly" ? 1 : period === "6months" ? 6 : 12;
  const baseAmount = plan.monthlyPrice * months;

  // Bonificación por período
  let periodDiscount = 0;
  if (period === "6months") periodDiscount = plan.discount6Months || 0;
  if (period === "12months") periodDiscount = plan.discount12Months || 0;

  // Código de descuento
  let codeDiscount = 0;
  if (discountCode) {
    const codeSnap = await admin.firestore()
      .collection("discountCodes").doc(discountCode.toUpperCase()).get();
    if (!codeSnap.exists) throw new Error("Código inválido");
    const code = codeSnap.data()!;
    if (!code.active) throw new Error("Código inactivo");
    if (code.validUntil?.toDate() < new Date()) throw new Error("Código vencido");
    if (code.maxUses && code.usedCount >= code.maxUses) throw new Error("Código sin usos");
    codeDiscount = code.percentage / 100;
  }

  const amountAfterPeriod = baseAmount * (1 - periodDiscount);
  const finalAmount = Math.round(amountAfterPeriod * (1 - codeDiscount));

  return { baseAmount, discountPeriod: periodDiscount, discountCode, finalAmount, months };
}
```

### 3.4. `functions/src/http/createCheckout.ts` — Crear checkout

```typescript
import { onCall, HttpsError } from "firebase-functions/v2/https";
import * as admin from "firebase-admin";
import { preApprovalClient, preferenceClient, APP_URL } from "../config/mp";
import { calculatePrice } from "../utils/pricing";

export const createCheckout = onCall(
  { region: "southamerica-east1", secrets: ["MP_ACCESS_TOKEN"] },
  async (request) => {
    // 1. Autenticación
    if (!request.auth) throw new HttpsError("unauthenticated", "Debe iniciar sesión");
    const uid = request.auth.uid;

    const { planId, period, discountCode } = request.data as {
      planId: string; period: "monthly" | "6months" | "12months"; discountCode?: string;
    };
    if (!planId || !period) throw new HttpsError("invalid-argument", "Datos incompletos");

    // 2. Obtener cuenta asociada al usuario
    const accountSnap = await admin.firestore()
      .collection("accounts").where("uid", "==", uid).limit(1).get();
    if (accountSnap.empty) throw new HttpsError("not-found", "Cuenta no encontrada");
    const account = { id: accountSnap.docs[0].id, ...accountSnap.docs[0].data() };

    // 3. Calcular precio
    const pricing = await calculatePrice(planId, period, discountCode);

    // 4. Crear en Mercado Pago
    let initPoint: string;
    let mpExternalRef: string;

    if (period === "monthly") {
      // Suscripción recurrente (Preapproval)
      const preapproval = await preApprovalClient.create({
        body: {
          reason: `Plan ${planId} - Mensual`,
          external_reference: `sub_${account.id}_${Date.now()}`,
          payer_email: account.email,
          auto_recurring: {
            frequency: 1,
            frequency_type: "months",
            transaction_amount: pricing.finalAmount,
            currency_id: "ARS",
            start_date: new Date().toISOString(),
          },
          back_url: `${APP_URL}/checkout/success`,
        },
      });
      initPoint = preapproval.init_point!;
      mpExternalRef = preapproval.id!;
    } else {
      // Pago único por 6 o 12 meses (Preference)
      const preference = await preferenceClient.create({
        body: {
          items: [{
            id: planId,
            title: `Plan ${planId} - ${period === "6months" ? "6" : "12"} meses`,
            quantity: 1,
            unit_price: pricing.finalAmount,
            currency_id: "ARS",
          }],
          payer: { email: account.email },
          external_reference: `sub_${account.id}_${Date.now()}`,
          back_urls: {
            success: `${APP_URL}/checkout/success`,
            failure: `${APP_URL}/checkout/failure`,
            pending: `${APP_URL}/checkout/pending`,
          },
          auto_return: "approved",
          expires: true,
          expiration_date_to: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
        },
      });
      initPoint = preference.init_point!;
      mpExternalRef = preference.id!;
    }

    // 5. Guardar suscripción pendiente
    const subRef = admin.firestore().collection("subscriptions").doc();
    await subRef.set({
      accountId: account.id,
      planId,
      period,
      status: "pending",
      mpExternalRef,
      discountCodeApplied: discountCode || null,
      pricing,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    // 6. Vincular a la cuenta
    await admin.firestore().collection("accounts").doc(account.id).update({
      pendingSubscriptionId: subRef.id,
    });

    return { initPoint, subscriptionId: subRef.id };
  }
);
```

### 3.5. `functions/src/http/mpWebhook.ts` — Webhook de Mercado Pago

```typescript
import { onRequest } from "firebase-functions/v2/https";
import * as admin from "firebase-admin";
import * as crypto from "crypto";

const WEBHOOK_SECRET = process.env.MP_WEBHOOK_SECRET!;

function verifySignature(req: any): boolean {
  const xSignature = req.get("x-signature");
  const xRequestId = req.get("x-request-id");
  if (!xSignature || !xRequestId) return false;

  const parts = xSignature.split(",");
  const ts = parts.find((p: string) => p.startsWith("ts="))?.split("=")[1];
  const hash = parts.find((p: string) => p.startsWith("v1="))?.split("=")[1];
  if (!ts || !hash) return false;

  // Data ID según tipo de notificación
  const dataId = req.query["data.id"] || req.body?.data?.id || req.body?.id;
  const manifest = `id:${dataId};request-id:${xRequestId};ts:${ts};`;

  const hmac = crypto.createHmac("sha256", WEBHOOK_SECRET).update(manifest).digest("hex");
  return hmac === hash;
}

export const mpWebhook = onRequest(
  { region: "southamerica-east1", secrets: ["MP_WEBHOOK_SECRET"] },
  async (req, res) => {
    if (!verifySignature(req)) {
      res.status(401).send("Firma inválida");
      return;
    }

    const topic = req.query.topic || req.body.type;
    const id = req.query.id || req.query["data.id"] || req.body.data?.id;

    try {
      if (topic === "payment" || topic === "merchant_order") {
        await handlePayment(id as string);
      } else if (topic === "preapproval") {
        await handlePreapproval(id as string);
      }
      res.status(200).send("OK");
    } catch (err) {
      console.error("Webhook error:", err);
      res.status(500).send("Error");
    }
  }
);

async function handlePayment(paymentId: string) {
  const { PaymentClient } = await import("mercadopago");
  const { mpClient } = await import("../config/mp");
  const paymentClient = new PaymentClient(mpClient);
  const payment = await paymentClient.get({ id: paymentId });

  const externalRef = payment.external_reference as string;
  if (!externalRef?.startsWith("sub_")) return;

  const subsSnap = await admin.firestore()
    .collection("subscriptions")
    .where("mpExternalRef", "==", externalRef)
    .limit(1).get();
  if (subsSnap.empty) return;

  const subRef = subsSnap.docs[0].ref;
  const sub = subsSnap.docs[0].data();

  // Registrar pago
  await admin.firestore().collection("payments").add({
    subscriptionId: subRef.id,
    mpPaymentId: payment.id,
    amount: payment.transaction_amount,
    status: payment.status,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  });

  if (payment.status === "approved") {
    // Calcular fecha de expiración según el período
    const months = sub.pricing?.months || 1;
    const expiresAt = new Date();
    expiresAt.setMonth(expiresAt.getMonth() + months);

    await subRef.update({
      status: "active",
      startDate: admin.firestore.FieldValue.serverTimestamp(),
      expiresAt: admin.firestore.Timestamp.fromDate(expiresAt),
      nextBillingDate: sub.period === "monthly"
        ? admin.firestore.FieldValue.serverTimestamp()
        : null,
    });

    // Actualizar cuenta
    await admin.firestore().collection("accounts").doc(sub.accountId).update({
      subscriptionId: subRef.id,
      pendingSubscriptionId: admin.firestore.FieldValue.delete(),
    });

    // Incrementar uso del código de descuento si corresponde
    if (sub.discountCodeApplied) {
      await admin.firestore()
        .collection("discountCodes").doc(sub.discountCodeApplied)
        .update({ usedCount: admin.firestore.FieldValue.increment(1) });
    }
  }
}

async function handlePreapproval(preapprovalId: string) {
  const { preApprovalClient } = await import("../config/mp");
  const preapproval = await preApprovalClient.get({ id: preapprovalId });

  const subsSnap = await admin.firestore()
    .collection("subscriptions")
    .where("mpExternalRef", "==", preapprovalId)
    .limit(1).get();
  if (subsSnap.empty) return;

  const subRef = subsSnap.docs[0].ref;
  const statusMap: Record<string, string> = {
    authorized: "active",
    paused: "paused",
    cancelled: "cancelled",
    expired: "cancelled",
  };

  await subRef.update({
    status: statusMap[preapproval.status] || preapproval.status,
  });
}
```

### 3.6. `functions/src/index.ts` — Exportaciones

```typescript
export { createCheckout } from "./http/createCheckout";
export { mpWebhook } from "./http/mpWebhook";
```

---

## 4. Frontend Angular

### 4.1. Servicio `MercadoPagoService`

```typescript
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
```

### 4.2. Componente de checkout

```typescript
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
      { period: '6months' as const, label: '6 meses',
        total: Math.round(base * 6 * (1 - plan.discount6Months)),
        savings: Math.round(base * 6 * plan.discount6Months) },
      { period: '12months' as const, label: '12 meses',
        total: Math.round(base * 12 * (1 - plan.discount12Months)),
        savings: Math.round(base * 12 * plan.discount12Months) },
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
```

### 4.3. Página de resultado

```typescript
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
```

---

## 5. Despliegue y configuración

### 5.1. Variables de entorno en Firebase

```bash
firebase functions:secrets:set MP_ACCESS_TOKEN
firebase functions:secrets:set MP_WEBHOOK_SECRET
firebase functions:config:set app.url="https://tu-app.com"
```

### 5.2. Configurar webhook en Mercado Pago

En el panel de Mercado Pago → **Webhooks** → Nueva URL:
```
https://southamerica-east1-tu-proyecto.cloudfunctions.net/mpWebhook
```

### 5.3. Desplegar

```bash
firebase deploy --only functions
```

---

## 6. Consideraciones importantes

| Aspecto | Recomendación |
|---|---|
| **Seguridad** | Nunca expongas el `ACCESS_TOKEN` en el cliente. Todo el cálculo de precios y creación de preferencias se hace en Cloud Functions. |
| **Idempotencia** | El webhook puede llegar varias veces. Usá `external_reference` único y verificá antes de actualizar. |
| **Suscripciones mensuales** | Mercado Pago las maneja automáticamente con `Preapproval`. Los cobros siguientes no requieren acción del usuario. |
| **Planes 6/12 meses** | Se crean como pago único (`Preference`) con `expires: true`. Cuando vence, el usuario debe renovar manualmente. |
| **Códigos de descuento** | Se validan en el backend. El `usedCount` se incrementa solo si el pago se aprueba. |
| **Moneda** | Hardcodeada en `ARS` para Argentina. |
| **Pruebas** | Usá usuarios de prueba de MP y tarjetas de testing antes de pasar a producción. |
| **Logs** | Todas las respuestas de MP deberían loguearse para debugging (usá `functions.logger`). |

---

## 7. Próximos pasos sugeridos

1. **Regla de seguridad Firestore** para que solo el dueño de la cuenta pueda leer su suscripción.
2. **Cloud Function programada** (`onSchedule`) que revise suscripciones vencidas diariamente y las marque como `expired`.
3. **Email transaccional** (vía Firebase Extensions o SendGrid) al confirmar pago.
4. **Portal de autogestión** donde el usuario pueda ver facturas, cambiar plan o cancelar suscripción (usando `preApprovalClient.update()`).

¿Querés que profundice en alguno de estos puntos (por ejemplo, el portal de autogestión, las reglas de Firestore o el manejo de errores)?