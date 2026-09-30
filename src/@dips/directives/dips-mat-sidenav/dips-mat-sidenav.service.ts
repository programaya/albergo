import { Injectable } from '@angular/core';
import { MatSidenav } from '@angular/material/sidenav';

@Injectable({
    providedIn: 'root'
})
export class DipsMatSidenavHelperService
{
    sidenavInstances: MatSidenav[];

    /**
     * Constructor
     */
    constructor()
    {
        this.sidenavInstances = [];
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Accessors
    // -----------------------------------------------------------------------------------------------------

    /**
     * Set sidenav
     *
     * @param id
     * @param instance
     */
    setSidenav(id: any, instance: any): void
    {
        this.sidenavInstances[id] = instance;
    }

    /**
     * Get sidenav
     *
     * @param id
     * @returns {any}
     */
    getSidenav(id: any): any
    {
        return this.sidenavInstances[id];
    }
}
