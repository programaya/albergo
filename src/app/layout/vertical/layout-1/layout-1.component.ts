import { Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { DipsConfigService } from '../../../../@dips/services/config.service';
import { navigation } from '../../../navigation/navigation';

@Component({
    selector     : 'vertical-layout-1',
    templateUrl  : './layout-1.component.html',
    styleUrls    : ['./layout-1.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class VerticalLayout1Component implements OnInit, OnDestroy
{
    dipsConfig: any;
    navigation: any;

    // Private
    private _unsubscribeAll: Subject<any>;

    /**
     * Constructor
     *
     * @param {DipsConfigService} _dipsConfigService
     */
    constructor(
        private _dipsConfigService: DipsConfigService
    )
    {
        // Set the defaults
        this.navigation = navigation;

        // Set the private defaults
        this._unsubscribeAll = new Subject();
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    /**
     * On init
     */
    ngOnInit(): void
    {
        // Subscribe to config changes
        this._dipsConfigService.config
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((config: any) => {
                this.dipsConfig = config;
            });
    }

    /**
     * On destroy
     */
    ngOnDestroy(): void
    {
        // Unsubscribe from all subscriptions
        this._unsubscribeAll.next();
        this._unsubscribeAll.complete();
    }

}
