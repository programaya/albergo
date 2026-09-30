import { Directive, EventEmitter, HostListener, Input, Output } from '@angular/core';
import { NgControl } from '@angular/forms';

@Directive({
  selector: '[appFileUpload]'
})

export class DipsFileUploaderDirective {

  constructor() { }

  background = '';
  @Input() private allowedExtensions: Array<string> = [];
  @Output() private filesChangeEmiter: EventEmitter<Array<File>> = new EventEmitter();
  @Output() private filesInvalidEmiter: EventEmitter<Array<File>> = new EventEmitter();

  @HostListener('drop', ['$event']) onDrop(e: any): void {
    e.preventDefault();
    e.stopPropagation();
    this.background = '#eee';
    const files = e.dataTransfer.files;
    const validFiles: Array<File> = [];
    const invalidFiles: Array<File> = [];
    if (files.length > 0) {
      for (const file of files) {
        const ext = file.name.split('.')[file.name.split('.').length - 1];
        if (
          (!this.allowedExtensions.length) ||
          (this.allowedExtensions.lastIndexOf(ext) !== -1)
        ) {
          validFiles.push(file);
        } else {
          invalidFiles.push(file);
        }
      }
      this.filesChangeEmiter.emit(validFiles);
      this.filesInvalidEmiter.emit(invalidFiles);
    }
  }

  @HostListener('dragover', ['$event']) onDragOver(e: any): void {
    e.preventDefault();
    e.stopPropagation();
  }
}
