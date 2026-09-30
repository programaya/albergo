import { Component, OnDestroy, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { delay, filter, take, takeUntil } from 'rxjs/operators';

import { DipsConfigService } from '../../../../../../@dips/services/config.service';
import { DipsNavigationService } from '../../../../../../@dips/components/navigation/navigation.service';
import { DipsPerfectScrollbarDirective } from '../../../../../../@dips/directives/dips-perfect-scrollbar/dips-perfect-scrollbar.directive';
import { DipsSidebarService } from '../../../../../../@dips/components/sidebar/sidebar.service';

@Component({
    selector     : 'navbar-vertical-style-2',
    templateUrl  : './style-2.component.html',
    styleUrls    : ['./style-2.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class NavbarVerticalStyle2Component implements OnInit, OnDestroy
{
    dipsConfig: any;
    navigation: any;

    // Private
    private _dipsPerfectScrollbar!: DipsPerfectScrollbarDirective;
    private _unsubscribeAll: Subject<any>;

    /**
     * Constructor
     *
     * @param {DipsConfigService} _dipsConfigService
     * @param {DipsNavigationService} _dipsNavigationService
     * @param {DipsSidebarService} _dipsSidebarService
     * @param {Router} _router
     */
    constructor(
        private _dipsConfigService: DipsConfigService,
        private _dipsNavigationService: DipsNavigationService,
        private _dipsSidebarService: DipsSidebarService,
        private _router: Router
    )
    {
        // Set the private defaults
        this._unsubscribeAll = new Subject();
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Accessors
    // -----------------------------------------------------------------------------------------------------

    // Directive
    @ViewChild(DipsPerfectScrollbarDirective, {static: true})
    set directive(theDirective: DipsPerfectScrollbarDirective)
    {
        if ( !theDirective )
        {
            return;
        }

        this._dipsPerfectScrollbar = theDirective;

        // Update the scrollbar on collapsable item toggle
        this._dipsNavigationService.onItemCollapseToggled
            .pipe(
                delay(500),
                takeUntil(this._unsubscribeAll)
            )
            .subscribe(() => {
                this._dipsPerfectScrollbar.update();
            });

        // Scroll to the active item position
        this._router.events
            .pipe(
                filter((event) => event instanceof NavigationEnd),
                take(1)
            )
            .subscribe(() => {
                    setTimeout(() => {
                        this._dipsPerfectScrollbar.scrollToElement('navbar .nav-link.active', -120);
                    });
                }
            );
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    /**
     * On init
     */
    ngOnInit(): void
    {
        this._router.events
            .pipe(
                filter((event) => event instanceof NavigationEnd),
                takeUntil(this._unsubscribeAll)
            )
            .subscribe(() => {
                    if ( this._dipsSidebarService.getSidebar('navbar') )
                    {
                        this._dipsSidebarService.getSidebar('navbar').close();
                    }
                }
            );

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

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Toggle sidebar opened status
     */
    toggleSidebarOpened(): void
    {
        this._dipsSidebarService.getSidebar('navbar').toggleOpen();
    }

    /**
     * Toggle sidebar folded status
     */
    toggleSidebarFolded(): void
    {
        this._dipsSidebarService.getSidebar('navbar').toggleFold();
    }
}
