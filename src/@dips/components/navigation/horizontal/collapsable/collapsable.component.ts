import { Component, HostBinding, HostListener, Input, OnDestroy, OnInit } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { dipsAnimations } from '../../../../animations';
import { DipsConfigService } from '../../../../services/config.service';

@Component({
    selector   : 'dips-nav-horizontal-collapsable',
    templateUrl: './collapsable.component.html',
    styleUrls  : ['./collapsable.component.scss'],
    animations : dipsAnimations
})
export class DipsNavHorizontalCollapsableComponent implements OnInit, OnDestroy
{
    dipsConfig: any;
    isOpen = false;

    @HostBinding('class')
    classes = 'nav-collapsable nav-item';

    @Input()
    item: any;

    // Private
    private _unsubscribeAll: Subject<any>;

    constructor(
        private _dipsConfigService: DipsConfigService
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
        // Subscribe to config changes
        this._dipsConfigService.config
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe(
                (config: any) => {
                    this.dipsConfig = config;
                }
            );
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

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Open
     */
    @HostListener('mouseenter')
    open(): void
    {
        this.isOpen = true;
    }

    /**
     * Close
     */
    @HostListener('mouseleave')
    close(): void
    {
        this.isOpen = false;
    }
}
