import { NgModule } from '@angular/core';

import { DipsSidebarComponent } from './sidebar.component';

@NgModule({
    declarations: [
        DipsSidebarComponent
    ],
    exports     : [
        DipsSidebarComponent
    ]
})
export class DipsSidebarModule
{
}
