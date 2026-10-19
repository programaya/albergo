// @serv/json-file/json-file.service.ts
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class JsonFileService {
  /**
   * Guarda una cadena JSON en un archivo .json en el dispositivo del usuario.
   * @param data - La cadena JSON a guardar.
   * @param filename - El nombre del archivo (sin extensión, se agregará .json).
   */
  saveJsonToFile(data: string, filename: string): void {
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url); // Libera el objeto URL
  }

  /**
   * Lee un archivo JSON seleccionado por el usuario y devuelve su contenido como objeto.
   * @param file - El archivo File seleccionado.
   * @returns Una promesa que resuelve con el objeto JSON leído.
   */
  readJsonFromFile(file: File): Promise<any> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const content = e.target?.result as string;
          const jsonData = JSON.parse(content);
          resolve(jsonData);
        } catch (error) {
          reject(error);
        }
      };
      reader.onerror = () => reject(new Error('Error al leer el archivo.'));
      reader.readAsText(file);
    });
  }
}