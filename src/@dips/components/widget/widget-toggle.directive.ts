import { Directive, ElementRef } from '@angular/core';

@Directive({
    selector: '[dipsWidgetToggle]'
})
export class DipsWidgetToggleDirective
{
    /**
     * Constructor
     *
     * @param {ElementRef} elementRef
     */
    constructor(
        public elementRef: ElementRef
    )
    {
    }
}
