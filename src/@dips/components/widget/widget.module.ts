import { NgModule } from '@angular/core';

import { DipsWidgetComponent } from './widget.component';
import { DipsWidgetToggleDirective } from './widget-toggle.directive';

@NgModule({
    declarations: [
        DipsWidgetComponent,
        DipsWidgetToggleDirective
    ],
    exports     : [
        DipsWidgetComponent,
        DipsWidgetToggleDirective
    ],
})
export class DipsWidgetModule
{
}
