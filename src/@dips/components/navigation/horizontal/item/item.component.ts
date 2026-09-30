import { Component, HostBinding, Input } from '@angular/core';

@Component({
    selector   : 'dips-nav-horizontal-item',
    templateUrl: './item.component.html',
    styleUrls  : ['./item.component.scss']
})
export class DipsNavHorizontalItemComponent
{
    @HostBinding('class')
    classes = 'nav-item';

    @Input()
    item: any;

    /**
     * Constructor
     */
    constructor()
    {

    }
}
