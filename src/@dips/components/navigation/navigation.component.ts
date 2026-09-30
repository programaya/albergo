import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnInit, ViewEncapsulation } from '@angular/core';
import { merge, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { DipsNavigationService } from 'src/@dips/components/navigation/navigation.service';

@Component({
    selector       : 'dips-navigation',
    templateUrl    : './navigation.component.html',
    styleUrls      : ['./navigation.component.scss'],
    encapsulation  : ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class DipsNavigationComponent implements OnInit
{
    @Input()
    layout = 'vertical';

    @Input()
    navigation: any;

    // Private
    private _unsubscribeAll: Subject<any>;

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
        // Load the navigation either from the input or from the service
        this.navigation = this.navigation || this._dipsNavigationService.getCurrentNavigation();

        // Subscribe to the current navigation changes
        this._dipsNavigationService.onNavigationChanged
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe(() => {

                // Load the navigation
                this.navigation = this._dipsNavigationService.getCurrentNavigation();

                // Mark for check
                this._changeDetectorRef.markForCheck();
            });

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
}
