import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class NumerosALetrasService {
    // Constantes gramaticales en español
    private readonly UNIDADES = ['', 'uno', 'dos', 'tres', 'cuatro', 'cinco', 'seis', 'siete', 'ocho', 'nueve'];
    private readonly DECENAS = ['', 'diez', 'veinte', 'treinta', 'cuarenta', 'cincuenta', 'sesenta', 'setenta', 'ochenta', 'noventa'];
    private readonly CENTENAS = ['', 'ciento', 'doscientos', 'trescientos', 'cuatrocientos', 'quinientos', 'seiscientos', 'setecientos', 'ochocientos', 'novecientos'];
    private readonly ESPECIALES_10_19 = ['diez', 'once', 'doce', 'trece', 'catorce', 'quince', 'dieciséis', 'diecisiete', 'dieciocho', 'diecinueve'];
    private readonly VEINTIS = ['veinte', 'veintiuno', 'veintidós', 'veintitrés', 'veinticuatro', 'veinticinco', 'veintiséis', 'veintisiete', 'veintiocho', 'veintinueve'];
    private readonly BASES_MILLON = ['millón', 'billón', 'trillón', 'cuatrillón', 'quintillón', 'sextillón', 'septillón', 'octillón', 'nonillón', 'decillón'];

    /**
     * Convierte un número a su representación en letras (español).
     * @param value Número o cadena numérica
     * @returns Texto con el número en palabras
     */
    numeroALetras(value: number | string): string {
        const input = String(value).trim();

        // Validación básica de formato numérico
        if (!/^-?\d+(\.\d+)?$/.test(input)) {
            throw new Error(`Formato de número inválido: "${input}"`);
        }

        const isNegative = input.startsWith('-');
        let cleanInput = input.replace(/^-/, '').replace(/^0+/, '');
        if (cleanInput === '') cleanInput = '0'; // Manejar "0" o "-0"

        const [intPart, decPart] = cleanInput.split('.');

        let result = this.convertIntegerPart(intPart);

        // Procesar decimales dígito a dígito
        if (decPart) {
            const cleanDec = decPart.replace(/0+$/, '');
            if (cleanDec) {
                const decWords = cleanDec
                    .split('')
                    .map(d => this.UNIDADES[Number(d)] || d)
                    .join(' ');
                result += ` con ${decWords}`;
            }
        }

        return (isNegative ? 'menos ' : '') + result.trim();
    }

    // --- Lógica interna ---

    private convertIntegerPart(str: string): string {
        if (str === '0') return 'cero';

        // Dividir en grupos de 3 dígitos desde la derecha
        const reversed = str.split('').reverse().join('');
        const chunks = reversed.match(/.{1,3}/g)!.map(s => s.split('').reverse().join('')).reverse();
        const parts: string[] = [];

        chunks.forEach((chunkStr, index) => {
            const chunkVal = Number(chunkStr);
            if (chunkVal === 0) return;

            const pos = chunks.length - 1 - index; // posición relativa (0=unidades, 1=miles, 2=millones...)
            let words = this.convertHundreds(chunkVal);

            // Ajuste gramatical antes de magnitudes masculinas
            if (pos > 0) {
                words = words.replace(/ uno$/, ' un').replace(/^uno$/, 'un');
                if (words.endsWith('veintiuno')) words = words.slice(0, -8) + 'veintiún';
            }

            // Caso especial: 1000 -> "mil" (nunca "un mil")
            if (pos === 1 && chunkVal === 1) {
                parts.push('mil');
                return;
            }

            let magnitude = '';
            if (pos === 1) {
                magnitude = 'mil';
            } else if (pos >= 2) {
                const baseIndex = Math.floor((pos - 2) / 2);
                const base = this.BASES_MILLON[baseIndex] || `magnitud_${baseIndex}`;

                // Posiciones pares: millón, billón, trillón...
                // Posiciones impares: mil millones, mil billones...
                if (pos % 2 === 0) {
                    magnitude = chunkVal === 1 ? base : base.replace('ón', 'ones');
                } else {
                    magnitude = `mil ${base.replace('ón', 'ones')}`;
                }

                // Caso especial: 1.000.000.000 -> "mil millones"
                if (pos % 2 !== 0 && pos >= 3 && chunkVal === 1) {
                    words = '';
                }
            }

            parts.push(words + (magnitude ? ` ${magnitude}` : ''));
        });

        return parts.join(' ');
    }

    private convertHundreds(n: number): string {
        if (n === 0) return '';
        if (n === 100) return 'cien';

        let res = '';
        if (n >= 100) {
            res += this.CENTENAS[Math.floor(n / 100)] + ' ';
            n %= 100;
        }
        res += this.convertTensAndUnits(n);
        return res.trim();
    }

    private convertTensAndUnits(n: number): string {
        if (n === 0) return '';
        if (n < 10) return this.UNIDADES[n];
        if (n < 20) return this.ESPECIALES_10_19[n - 10];
        if (n < 30) return this.VEINTIS[n - 20];

        const tens = this.DECENAS[Math.floor(n / 10)];
        const units = this.UNIDADES[n % 10];
        return units ? `${tens} y ${units}` : tens;
    }
}