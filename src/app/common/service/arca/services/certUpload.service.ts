import { Injectable } from '@angular/core';
import { 
  Storage, 
  ref, 
  uploadBytes, 
  getDownloadURL,
  getMetadata,
  listAll
} from '@angular/fire/storage';
import { from, Observable } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FirebaseStorageService {

  constructor(
    private _storage: Storage
  ) {}

  /**
   * Sube un archivo a una ruta específica
   * @param path Ruta en Storage donde se guardará el archivo
   * @param file Archivo a subir
   * @returns Observable con la URL de descarga
   */
  uploadFile(path: string, file: File): Observable<string> {
    const storageRef = ref(this._storage, path);
    const uploadTask = uploadBytes(storageRef, file);

    return from(uploadTask.then(() => getDownloadURL(storageRef)));
  }

  /**
   * Verifica si un archivo ya existe en la ruta especificada
   * @param path Ruta del archivo a verificar
   * @returns Observable<boolean> true si existe, false si no
   */
  fileExists(path: string): Observable<boolean> {
    const storageRef = ref(this._storage, path);
    return from(getMetadata(storageRef).then(() => true).catch(() => false));
  }

}
