import { NgFor, NgIf } from '@angular/common';
import { Component, Input, Output, EventEmitter, HostListener } from '@angular/core';

@Component({
  selector: 'file-drag-drop',
  standalone: true,
  imports: [
    NgIf,
    NgFor
   ],
  templateUrl: './file-drag-drop.component.html',
  styleUrls: ['./file-drag-drop.component.scss']

})
export class FileDragDropComponent {
  @Input() multiple: boolean = false;
  @Input() accept: string = '';
  @Input() maxSize: number = 0; // en bytes, 0 para ilimitado
  @Input() maxFiles: number = 0; // 0 para ilimitado
  @Input() allowedTypes: string[] = [];
  @Input() title: string = '';
  @Input() subtitle: string = '';
  @Input() showPreview: boolean = false;
  
  @Output() filesSelected = new EventEmitter<File[]>();
  @Output() fileRemoved = new EventEmitter<File>();
  @Output() error = new EventEmitter<string>();

  selectedFiles: File[] = [];
  isDragOver = false;
  hasError = false;
  errorMessage = '';

  private fileInputRef?: HTMLInputElement;

  constructor() {}

  onDragOver(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = true;
  }

  onDragLeave(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = false;
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = false;
    
    if (event.dataTransfer?.files) {
      this.handleFiles(event.dataTransfer.files);
    }
  }

  @HostListener('paste', ['$event'])
  onPaste(event: ClipboardEvent) {
    if (event.clipboardData?.files.length) {
      this.handleFiles(event.clipboardData.files);
    }
  }

  onFileSelected(event: any) {
    if (event.target.files) {
      this.handleFiles(event.target.files);
    }
  }

  triggerFileInput() {
    if (!this.fileInputRef) {
      this.fileInputRef = document.createElement('input');
      this.fileInputRef.type = 'file';
      this.fileInputRef.multiple = this.multiple;
      this.fileInputRef.accept = this.accept;
      this.fileInputRef.onchange = (event: any) => this.onFileSelected(event);
    }
    this.fileInputRef.click();
  }

  private handleFiles(files: FileList) {
    const validFiles: File[] = [];
    let errorFound = false;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      
      // Validar tipo de archivo
      if (this.allowedTypes.length > 0) {
        const fileType = file.type || this.getFileExtension(file.name);
        if (!this.allowedTypes.some(type => fileType.includes(type) || file.name.toLowerCase().includes(type))) {
          this.showError(`Tipo de archivo no permitido: ${file.name}`);
          errorFound = true;
          continue;
        }
      }

      // Validar tamaño
      if (this.maxSize > 0 && file.size > this.maxSize) {
        this.showError(`Archivo demasiado grande: ${file.name} (máximo: ${this.formatFileSize(this.maxSize)})`);
        errorFound = true;
        continue;
      }

      // Validar cantidad de archivos
      if (this.maxFiles > 0 && 
          (this.selectedFiles.length + validFiles.length) >= this.maxFiles) {
        this.showError(`Número máximo de archivos alcanzado: ${this.maxFiles}`);
        errorFound = true;
        break;
      }

      validFiles.push(file);
    }

    if (validFiles.length > 0) {
      if (this.multiple) {
        this.selectedFiles = [...this.selectedFiles, ...validFiles];
      } else {
        this.selectedFiles = validFiles.slice(0, 1); // Solo el primer archivo
      }
      this.filesSelected.emit(this.selectedFiles);
      this.hasError = false;
      this.errorMessage = '';
    }

    if (errorFound && validFiles.length === 0) {
      this.hasError = true;
    }
  }

  removeFile(index: number) {
    const removedFile = this.selectedFiles.splice(index, 1)[0];
    this.fileRemoved.emit(removedFile);
    this.filesSelected.emit(this.selectedFiles);
  }

  clearFiles() {
    this.selectedFiles = [];
    this.filesSelected.emit([]);
  }

  private showError(message: string) {
    this.errorMessage = message;
    this.hasError = true;
    this.error.emit(message);
    
    // Limpiar error después de 5 segundos
    setTimeout(() => {
      this.errorMessage = '';
      this.hasError = false;
    }, 5000);
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  private getFileExtension(filename: string): string {
    return filename.slice((filename.lastIndexOf('.') - 1 >>> 0) + 2);
  }

  getFileIcon(fileType: string): string {
    if (fileType.includes('image')) return '🖼️';
    if (fileType.includes('pdf')) return '📄';
    if (fileType.includes('word') || fileType.includes('document')) return '📝';
    if (fileType.includes('excel') || fileType.includes('spreadsheet')) return '📊';
    if (fileType.includes('audio')) return '🎵';
    if (fileType.includes('video')) return '🎬';
    if (fileType.includes('zip') || fileType.includes('compressed')) return '📦';
    return '📁';
  }
}