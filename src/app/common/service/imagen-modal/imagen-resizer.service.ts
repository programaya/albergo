// src/app/shared/services/image-resizer.service.ts
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ImageResizerService {

  /**
   * Redimensiona una imagen manteniendo proporción.
   * @param file Archivo de imagen
   * @param maxWidth Ancho máximo (px)
   * @param maxHeight Alto máximo (px)
   * @param outputType 'image/jpeg' | 'image/png' (por defecto 'image/jpeg')
   * @param quality Calidad para JPEG (0–1)
   * @returns Promise<Blob>
   */
  async resizeImage(
    file: File,
    maxWidth: number = 300,
    maxHeight: number = 75,
    outputType: 'image/jpeg' | 'image/png' = 'image/jpeg',
    quality: number = 0.85
  ): Promise<Blob> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        reject(new Error('No se pudo crear el contexto del canvas'));
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        img.src = e.target?.result as string;
      };
      reader.onerror = () => reject(reader.error);
      reader.readAsDataURL(file);

      img.onload = () => {
        let { width, height } = img;

        // Escalar manteniendo aspecto
        const ratio = Math.min(maxWidth / width, maxHeight / height, 1);
        width = Math.floor(width * ratio);
        height = Math.floor(height * ratio);

        canvas.width = width;
        canvas.height = height;

        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (blob) resolve(blob);
            else reject(new Error('Error al generar el blob'));
          },
          outputType,
          outputType === 'image/jpeg' ? quality : undefined
        );
      };

      img.onerror = () => reject(new Error('Error al cargar la imagen'));
    });
  }
}