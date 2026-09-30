import { ModuleWithProviders, NgModule, Optional, SkipSelf } from '@angular/core';

import { DIPS_CONFIG } from './services/config.service';

@NgModule()
export class DipsModule {
    constructor(@Optional() @SkipSelf() parentModule: DipsModule) {
        if ( parentModule )
        {
            throw new Error('DipsModule is already loaded. Import it in the AppModule only!');
        }
    }

    static forRoot(config: any): ModuleWithProviders<any> {
        return {
            ngModule : DipsModule,
            providers: [
                {
                    provide : DIPS_CONFIG,
                    useValue: config
                }
            ]
        };
    }
}
