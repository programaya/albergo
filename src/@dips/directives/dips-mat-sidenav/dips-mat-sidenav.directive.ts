import { Directive, Input, OnInit, HostListener, OnDestroy, HostBinding } from '@angular/core';
import { MatSidenav } from '@angular/material/sidenav';
import { MediaObserver } from '@angular/flex-layout';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { DipsMatchMediaService } from 'src/@dips/services/match-media.service';
import { DipsMatSidenavHelperService } from 'src/@dips/directives/dips-mat-sidenav/dips-mat-sidenav.service';

@Directive({
    selector: '[dipsMatSidenavHelper]'
})
export class DipsMatSidenavHelperDirective implements OnInit, OnDestroy
{
    @HostBinding('class.mat-is-locked-open')
    isLockedOpen: boolean;

    @Input()
    dipsMatSidenavHelper: any;

    @Input()
    matIsLockedOpen: any;

    // Private
    private _unsubscribeAll: Subject<any>;

    /**
     * Constructor
     *
     * @param {DipsMatchMediaService} _dipsMatchMediaService
     * @param {DipsMatSidenavHelperService} _dipsMatSidenavHelperService
     * @param {MatSidenav} _matSidenav
     * @param {MediaObserver} _mediaObserver
     */
    constructor(
        private _dipsMatchMediaService: DipsMatchMediaService,
        private _dipsMatSidenavHelperService: DipsMatSidenavHelperService,
        private _matSidenav: MatSidenav,
        private _mediaObserver: MediaObserver
    )
    {
        // Set the defaults
        this.isLockedOpen = true;

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
        // Register the sidenav to the service
        this._dipsMatSidenavHelperService.setSidenav(this.dipsMatSidenavHelper, this._matSidenav);

        if ( this.matIsLockedOpen && this._mediaObserver.isActive(this.matIsLockedOpen) )
        {
            this.isLockedOpen = true;
            this._matSidenav.mode = 'side';
            this._matSidenav.toggle(true);
        }
        else
        {
            this.isLockedOpen = false;
            this._matSidenav.mode = 'over';
            this._matSidenav.toggle(false);
        }

        this._dipsMatchMediaService.onMediaChange
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe(() => {
                if ( this.matIsLockedOpen && this._mediaObserver.isActive(this.matIsLockedOpen) )
                {
                    this.isLockedOpen = true;
                    this._matSidenav.mode = 'side';
                    this._matSidenav.toggle(true);
                }
                else
                {
                    this.isLockedOpen = false;
                    this._matSidenav.mode = 'over';
                    this._matSidenav.toggle(false);
                }
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

@Directive({
    selector: '[dipsMatSidenavToggler]'
})
export class DipsMatSidenavTogglerDirective
{
    @Input()
    dipsMatSidenavToggler: any;

    /**
     * Constructor
     *
     * @param {DipsMatSidenavHelperService} _dipsMatSidenavHelperService
     */
    constructor(
        private _dipsMatSidenavHelperService: DipsMatSidenavHelperService)
    {
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * On click
     */
    @HostListener('click')
    onClick(): void
    {
        this._dipsMatSidenavHelperService.getSidenav(this.dipsMatSidenavToggler).toggle();
    }
}
