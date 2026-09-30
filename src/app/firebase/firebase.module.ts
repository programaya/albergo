import { NgModule, ModuleWithProviders } from '@angular/core';

import { AngularFireModule } from '@angular/fire/compat';
import { AngularFirestoreModule } from '@angular/fire/compat/firestore';

@NgModule({
  imports: [AngularFirestoreModule]
})


export class FirebaseModule {
  static forRoot(): Array<ModuleWithProviders<AngularFireModule>> {
    return [
      AngularFireModule.initializeApp({
        projectId: 'albergo-dips',
        databaseURL: 'https://albergo-dips-default-rtdb.firebaseio.com'
      })
    ];
  }
}
