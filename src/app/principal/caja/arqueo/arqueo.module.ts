import { NgModule } from '@angular/core';
import { CommonModule, registerLocaleData } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import localeEsAr from '@angular/common/locales/es-AR';

// Material
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBarModule } from '@angular/material/snack-bar';

// DIPS
import { DipsSharedModule } from '../../../../@dips/shared.module'
import { DipsConfirmDialogModule } from '../../../../@dips/components/confirm-dialog/confirm-dialog.module';

// Componentes
import { ArqueoComponent } from './arqueo.component'
import { DetalleArqueoModule } from './detalle-arqueo/detalle-arqueo.module';
import { ModalMovimientosComponent } from './modal-movimientos/modal-movimientos.component'
import { MontoInicialComponent } from './monto-inicial/monto-inicial.component';
import { MontoArqueoComponent } from './monto-arqueo/monto-arqueo.component';
import { TotalEfectivoComponent } from './total-efectivo/total-efectivo.component';
import { TotalDebitoComponent } from './total-debito/total-debito.component';
import { TotalCreditoComponent } from './total-credito/total-credito.component';
import { TotalBilleteraComponent } from './total-billetera/total-billetera.component';
import { TotalChequeComponent } from './total-cheque/total-cheque.component';
import { TotalTransferenciaComponent } from './total-transferencia/total-transferencia.component';
import { TotalMovimientoComponent } from './total-movimiento/total-movimiento.component';

registerLocaleData(localeEsAr, 'es-AR');

import { ArqueoRoutingModule } from './arqueo-routing.module';

@NgModule({
    declarations: [
        ArqueoComponent,
        ModalMovimientosComponent,
        MontoInicialComponent,
        MontoArqueoComponent,
        TotalEfectivoComponent,
        TotalDebitoComponent,
        TotalCreditoComponent,
        TotalBilleteraComponent,
        TotalChequeComponent,
        TotalTransferenciaComponent,
        TotalMovimientoComponent
    ],
    imports: [
        CommonModule,
        DetalleArqueoModule,
        FormsModule,
        ReactiveFormsModule,
        ArqueoRoutingModule,
        MatButtonModule,
        MatCardModule,
        MatDialogModule,
        MatFormFieldModule,
        MatIconModule,
        MatInputModule,
        MatTableModule,
        MatTooltipModule,
        MatSnackBarModule,
        DipsSharedModule,
        DipsConfirmDialogModule
    ],
    exports: [ArqueoComponent]
})
export class ArqueoModule { }
