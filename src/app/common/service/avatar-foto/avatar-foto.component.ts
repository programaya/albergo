import { NgClass, NgIf, NgStyle } from '@angular/common';
import { Component, OnInit, Input, OnChanges, SimpleChanges } from '@angular/core';

@Component({
    selector: 'app-avatar-foto',
    imports: [
        NgIf,
        NgStyle,
        NgClass
    ],
    templateUrl: './avatar-foto.component.html',
    styleUrls: ['./avatar-foto.component.scss'],
})
export class AvatarFotoComponent implements OnInit, OnChanges {

    @Input()
    public avatarFoto!: any;

    @Input()
    public avatarNombre!: any;

    @Input() 
    public tipo: 'chico' | 'grande' = 'chico';

    public showInicial = false;
    public iniciales!: string;
    public circleColor!: string;

    ngOnInit() {

        this.fotoNombre()

    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['avatarFoto'] || changes['avatarNombre']) {
            this.fotoNombre()
        }
    }

    private fotoNombre() {

        if (!this.avatarFoto && this.avatarNombre) {
            this.showInicial = true;
            this.obtenerInicialesYColor()
        }

    }



    private obtenerInicialesYColor() {
        // Extraer iniciales
        const palabras = this.avatarNombre.trim().split(/\s+/);
        let iniciales = '';
        
        for (const palabra of palabras) {
          if (palabra.length > 0) {
            iniciales += palabra[0].toUpperCase();
          }
        }
      
        // Obtener primera inicial
        const primeraLetra = iniciales.charAt(0).toUpperCase();
      
        // Definir colores por grupos alfabéticos
        const gruposColores: Record<string, string> = {
          'A-F': '#FF6B6B', // Rojo suave
          'G-L': '#4ECDC4', // Verde turquesa
          'M-R': '#45B7D1', // Azul cielo
          'S-Z': '#96CEB4'  // Verde menta
        };
      
        const codigoLetra = primeraLetra.charCodeAt(0);
      
        let colorAsignado = '';
      
        if (codigoLetra >= 65 && codigoLetra <= 70) {
          colorAsignado = gruposColores['A-F'];
        } else if (codigoLetra >= 71 && codigoLetra <= 76) {
          colorAsignado = gruposColores['G-L'];
        } else if (codigoLetra >= 77 && codigoLetra <= 82) {
          colorAsignado = gruposColores['M-R'];
        } else if (codigoLetra >= 83 && codigoLetra <= 90) {
          colorAsignado = gruposColores['S-Z'];
        } else {
          // Por defecto si no es una letra válida
          colorAsignado = '#CCCCCC'; // Gris neutro
        }
      
        this.iniciales = iniciales
        this.circleColor = colorAsignado

    }
}