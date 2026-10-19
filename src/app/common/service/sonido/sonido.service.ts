import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class DipsSonidoService {

    //Sonido
    private audio: HTMLAudioElement | null = null;
    private isBrowser: boolean;

  constructor(
      @Inject(PLATFORM_ID) private platformId: Object ) { 
          // se ejecuta en el browser?
          this.isBrowser = isPlatformBrowser(this.platformId);
      }

      reproducirSonido(rutaSonido: string): void {
        // Solo ejecutar en el navegador
        if (!this.isBrowser) {
          console.warn('Reproducción ignorada: no disponible en SSR');
          return;
        }
    
        try {
          this.audio = new Audio();
          this.audio.src = rutaSonido
          this.audio.load(); 
          this.audio.play().catch(error => {
            console.warn('No se pudo reproducir el sonido:', error);
          });
        } catch (err) {
          console.error('Error al intentar reproducir sonido', err);
        }
      }

}


