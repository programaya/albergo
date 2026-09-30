import { Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { Subject } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';

import { DipsConfigService } from '../../../../../../@dips/services/config.service';
import { DipsNavigationService } from 'src/@dips/components/navigation/navigation.service';
import { DipsSidebarService } from 'src/@dips/components/sidebar/sidebar.service';

@Component({
    selector     : 'navbar-horizontal-style-1',
    templateUrl  : './style-1.component.html',
    styleUrls    : ['./style-1.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class NavbarHorizontalStyle1Component implements OnInit, OnDestroy
{
    dipsConfig: any;
    navigation: any;

    // Private
    private _unsubscribeAll: Subject<any>;

    /**
     * Constructor
     *
     * @param {DipsConfigService} _dipsConfigService
     * @param {DipsNavigationService} _dipsNavigationService
     * @param {DipsSidebarService} _dipsSidebarService
     */
    constructor(
        private _dipsConfigService: DipsConfigService,
        private _dipsNavigationService: DipsNavigationService,
        private _dipsSidebarService: DipsSidebarService
    )
    {
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
        // Get current navigation
        this._dipsNavigationService.onNavigationChanged
            .pipe(
                filter(value => value !== null),
                takeUntil(this._unsubscribeAll)
            )
            .subscribe(() => {
                this.navigation = this._dipsNavigationService.getCurrentNavigation();
            });

        // Subscribe to the config changes
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
