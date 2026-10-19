import { Directive, ElementRef, HostListener, inject } from '@angular/core';

@Directive({
  selector: '[appEnterToTab]',
  standalone: true
})
export class EnterToTabDirective {
  private readonly el = inject(ElementRef<HTMLInputElement>);

  @HostListener('keydown.enter', ['$event'])
  onKeyDown = (event: KeyboardEvent): void => {
    event.preventDefault();

    const currentElement = this.el.nativeElement;
    const form = currentElement.closest('form');

    if (form) {
      const focusableElements = this.getFocusableElements(form);
      const currentIndex = focusableElements.indexOf(currentElement);

      if (currentIndex >= 0 && currentIndex < focusableElements.length - 1) {
        this.focusNextElement(focusableElements[currentIndex + 1]);
      }
    }
  }

  private getFocusableElements(form: Element): HTMLElement[] {
    const allElements = Array.from(
      form.querySelectorAll(
        'input:not([disabled]):not([readonly]), ' +
        'select:not([disabled]):not([readonly]), ' +
        'textarea:not([disabled]):not([readonly]), ' +
        'button:not([disabled]), ' +
        '[tabindex]:not([tabindex="-1"]):not([disabled])'
      )
    );

    return allElements.filter((el: Element) => {
      const element = el as HTMLElement;
      const style = getComputedStyle(element);
      return !element.hasAttribute('disabled') &&
        style.display !== 'none' &&
        style.visibility !== 'hidden';
    }) as HTMLElement[];
  }

  private focusNextElement(element: HTMLElement): void {
    element.focus({ preventScroll: true });

    if ((element instanceof HTMLInputElement ||
      element instanceof HTMLTextAreaElement) &&
      element.type !== 'checkbox' &&
      element.type !== 'radio') {
      setTimeout(() => {
        element.setSelectionRange(element.value.length, element.value.length);
      }, 0);
    }
  }
}