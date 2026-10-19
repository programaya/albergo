import { Injectable } from '@angular/core';
import {
  Storage,
  ref,
  uploadBytes,
  getDownloadURL
} from '@angular/fire/storage';


@Injectable({
  providedIn: 'root'
})
export class SubeArchivosService {

  constructor(
    private _storage: Storage
  ) { }

  // Subir archivo a Firebase Storage
  async subirCertificado(file: File, fileName: string) {

    const storageRef = ref(this._storage, fileName);
    const snapshot = await uploadBytes(storageRef, file);

  }

  // Subir imagen (a Firebase Storage)
  async subirImagen(file: File, fileName: string): Promise<string> {

    const storageRef = ref(this._storage, fileName);
    const snapshot = await uploadBytes(storageRef, file);
    return await getDownloadURL(snapshot.ref);
  }
  // async uploadImage(userId: string, file: File, folder: string = 'images'): Promise<string> {
  //   const storageRef = ref(this._storage, `${folder}/${userId}_${file.name}`);
  //   const snapshot = await uploadBytes(storageRef, file);
  //   return await getDownloadURL(snapshot.ref);
  // }  

}
