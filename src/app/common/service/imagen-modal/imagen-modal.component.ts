// src/app/shared/components/image-resizer-modal/image-resizer-modal.component.ts
import { Component, Input, Output, EventEmitter, inject, OnDestroy } from '@angular/core';
import { FileDragDropComponent } from '@serv/file-drag-drop/file-drag-drop.component';
import { ImageResizerService } from './imagen-resizer.service'
import { NgIf } from '@angular/common';

export interface ImageResizeConfig {
  maxWidth: number;
  maxHeight: number;
  outputType: 'image/jpeg' | 'image/png';
  quality?: number; // solo para JPEG
  defaultFileName: string;
}

@Component({
  selector: 'app-imagen-modal',
  standalone: true,
  imports: [
    FileDragDropComponent, 
    NgIf
  ],
  templateUrl: './imagen-modal.component.html',
  styleUrls: ['./imagen-modal.component.scss']
})
export class ImagenModalComponent implements OnDestroy {
  private imageResizer = inject(ImageResizerService);

  @Input() title: string = 'Seleccionar imagen';
  @Input() config: ImageResizeConfig = {
    maxWidth: 300,
    maxHeight: 75,
    outputType: 'image/jpeg',
    quality: 0.85,
    defaultFileName: 'imagen.jpg'
  };

  @Output() imageSelected = new EventEmitter<File>();
  @Output() canceled = new EventEmitter<void>();

  resizedFile: File | null = null;
  previewUrl: string | null = null;
  processing = false;
  errorMessage: string | null = null;

  async onFilesSelected(files: File[]) {
    if (files.length === 0 || this.processing) return;

    const originalFile = files[0];
    this.processing = true;
    this.errorMessage = null;

    try {
      const blob = await this.imageResizer.resizeImage(
        originalFile,
        this.config.maxWidth,
        this.config.maxHeight,
        this.config.outputType,
        this.config.quality
      );

      // Determinar extensión según tipo de salida
      const extension = this.config.outputType === 'image/png' ? '.png' : '.jpg';
      const fileName = this.config.defaultFileName.endsWith(extension)
        ? this.config.defaultFileName
        : this.config.defaultFileName.replace(/\.[^/.]+$/, '') + extension;

      const resizedFile = new File([blob], fileName, { type: this.config.outputType });

      this.resizedFile = resizedFile;
      this.previewUrl = URL.createObjectURL(blob);
      
    } catch (err) {
      console.error('Error al redimensionar la imagen:', err);
      this.errorMessage = 'No se pudo procesar la imagen. Verifica que sea un archivo válido.';
    } finally {
      this.processing = false;
    }
  }

  onUploadError(error: string) {
    this.errorMessage = error;
    setTimeout(() => this.errorMessage = null, 5000);
  }

  confirmImage() {
    if (this.resizedFile) {
      this.imageSelected.emit(this.resizedFile);
      this.cleanup();
    }
  }

  closeModal() {
    this.cleanup();
    this.canceled.emit();
  }

  private cleanup() {
    if (this.previewUrl) {
      URL.revokeObjectURL(this.previewUrl);
      this.previewUrl = null;
    }
    this.resizedFile = null;
    this.errorMessage = null;
  }

  ngOnDestroy() {
    this.cleanup();
  }
}