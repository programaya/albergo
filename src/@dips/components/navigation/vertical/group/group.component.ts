import { ChangeDetectorRef, Component, HostBinding, Input, OnDestroy, OnInit } from '@angular/core';
import { merge, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { DipsNavigationItem } from 'src/@dips/types';
import { DipsNavigationService } from 'src/@dips/components/navigation/navigation.service';

@Component({
    selector   : 'dips-nav-vertical-group',
    templateUrl: './group.component.html',
    styleUrls  : ['./group.component.scss']
})
export class DipsNavVerticalGroupComponent implements OnInit, OnDestroy
{
    @HostBinding('class')
    classes = 'nav-group nav-item';

    @Input()
    item!: DipsNavigationItem;

    // Private
    private _unsubscribeAll: Subject<any>;

    /**
     * Constructor
     */

    /**
     *
     * @param {ChangeDetectorRef} _changeDetectorRef
     * @param {DipsNavigationService} _dipsNavigationService
     */
    constructor(
        private _changeDetectorRef: ChangeDetectorRef,
        private _dipsNavigationService: DipsNavigationService
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
        // Subscribe to navigation item
        merge(
            this._dipsNavigationService.onNavigationItemAdded,
            this._dipsNavigationService.onNavigationItemUpdated,
            this._dipsNavigationService.onNavigationItemRemoved
        ).pipe(takeUntil(this._unsubscribeAll))
         .subscribe(() => {

             // Mark for check
             this._changeDetectorRef.markForCheck();
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
