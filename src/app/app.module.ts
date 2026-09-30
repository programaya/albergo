
import { BrowserModule } from '@angular/platform-browser';
import { isDevMode, NgModule } from '@angular/core';
import { LOCALE_ID } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { ServiceWorkerModule } from '@angular/service-worker';
import { environment } from '../environments/environment';

import { AutentificacionService } from './sesion/autentificacion.service';
import { SesionGuard } from './sesion/sesion.guard';

import { AngularFireModule } from '@angular/fire/compat';

import {
//  AngularFireAnalyticsModule,
  APP_NAME,
  APP_VERSION,
  DEBUG_MODE as ANALYTICS_DEBUG_MODE,
  ScreenTrackingService,
  UserTrackingService,
  COLLECTION_ENABLED
} from '@angular/fire/compat/analytics';

//import { FirestoreComponent } from './firestore/firestore.component';
import { AngularFireDatabaseModule, USE_EMULATOR as USE_DATABASE_EMULATOR } from '@angular/fire/compat/database';
import { AngularFirestoreModule, USE_EMULATOR as USE_FIRESTORE_EMULATOR, SETTINGS as FIRESTORE_SETTINGS } from '@angular/fire/compat/firestore';
//import { AngularFireStorageModule, USE_EMULATOR as USE_STORAGE_EMULATOR } from '@angular/fire/compat/storage';
import { AngularFireAuthModule, USE_DEVICE_LANGUAGE, USE_EMULATOR as USE_AUTH_EMULATOR } from '@angular/fire/compat/auth';
import { AngularFireMessagingModule, SERVICE_WORKER, VAPID_KEY } from '@angular/fire/compat/messaging';
//import { AngularFireFunctionsModule, USE_EMULATOR as USE_FUNCTIONS_EMULATOR } from '@angular/fire/compat/functions';
import { AngularFireRemoteConfigModule, SETTINGS as REMOTE_CONFIG_SETTINGS, DEFAULTS as REMOTE_CONFIG_DEFAULTS } from '@angular/fire/compat/remote-config';
import { AngularFirePerformanceModule, PerformanceMonitoringService } from '@angular/fire/compat/performance';
import { AngularFireAuthGuardModule } from '@angular/fire/compat/auth-guard';

// import { DatabaseComponent } from './database/database.component';
// import { StorageComponent } from './storage/storage.component';
// import { RemoteConfigComponent } from './remote-config/remote-config.component';
// import { HomeComponent } from './home/home.component';
// import { AuthComponent } from './auth/auth.component';
// import { MessagingComponent } from './messaging/messaging.component';
// import { FunctionsComponent } from './functions/functions.component';
// import { UpboatsComponent } from './upboats/upboats.component';

import { initializeApp, provideFirebaseApp } from '@angular/fire/app';

// Material y generals
import { HttpClientModule } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
//import { MatMomentDateModule } from '@angular/material-moment-adapter';
//import { MatButtonModule } from '@angular/material/button';
//import { MatIconModule } from '@angular/material/icon';
import { TranslateModule } from '@ngx-translate/core';

// DIPS
import { DipsModule } from '../@dips/dips.module';
import { DipsSharedModule } from '../@dips/shared.module';
import { DipsProgressBarModule, DipsSidebarModule, DipsThemeOptionsModule } from '../@dips/components';
import { DipsUsuarioService } from './../@dips/services/usuario.service';
import { DipsParametroService } from '../@dips/services/parametro/parametro.service';

import { dipsConfig } from './dips-config';
import { DipsAppUpdateService } from 'src/@dips/services/pwaupgrade/pwa-upgrade.service';

// Modulos Principales
import { LayoutModule } from './layout/layout.module';
import { FlexLayoutModule } from '@angular/flex-layout';
import { PrincipalModule } from './principal/principal.module';
import { SesionModule } from './sesion/sesion.module';

import { registerLocaleData } from '@angular/common'; 

// importar idiomas locales
import localeEsAr from '@angular/common/locales/es-AR';
import { provideAuth,getAuth } from '@angular/fire/auth';
import { provideDatabase,getDatabase } from '@angular/fire/database';
import { provideFirestore,getFirestore } from '@angular/fire/firestore';
import { provideMessaging,getMessaging } from '@angular/fire/messaging';

// registrar idiomas locales
registerLocaleData(localeEsAr, 'es-Ar');


@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    
    BrowserModule.withServerTransition({ appId: 'serverApp' }),
    AppRoutingModule,
    ServiceWorkerModule.register('ngsw-worker.js', {
      enabled: environment.production,
      // Register the ServiceWorker as soon as the app is stable
      // or after 30 seconds (whichever comes first).
      registrationStrategy: 'registerWhenStable:30000'
    }),



  // declarations: [
  //   AppComponent,
  //   StorageComponent,
  //   FirestoreComponent,
  //   DatabaseComponent,
  //   RemoteConfigComponent,
  //   HomeComponent,
  //   AuthComponent,
  //   MessagingComponent,
  //   FunctionsComponent,
  //   UpboatsComponent,
  // ],
//  imports: [
//    BrowserModule.withServerTransition({ appId: 'serverApp' }),
//    AppRoutingModule,
//    ServiceWorkerModule.register('ngsw-worker.js', { enabled: environment.production }),
    AngularFireModule.initializeApp(environment.firebase),
//    AngularFireStorageModule,
    AngularFireDatabaseModule,
    AngularFirestoreModule.enablePersistence({ synchronizeTabs: true }),
    AngularFireAuthModule,
    AngularFireAuthGuardModule,
    // AngularFireRemoteConfigModule,
    // AngularFireMessagingModule,
    // AngularFireAnalyticsModule,
//    AngularFireFunctionsModule,
//    AngularFirePerformanceModule,
    // provide modular style for AppCheck, see app.browser/server
    provideFirebaseApp(() => initializeApp(environment.firebase)),

    BrowserAnimationsModule,

        // modulos generales
        BrowserAnimationsModule,
        HttpClientModule,
//        NgxSliderModule,
        
        TranslateModule.forRoot(),
    

        // Dips modules
        DipsModule.forRoot(dipsConfig),
        DipsProgressBarModule,
        DipsSharedModule,
        DipsSidebarModule,
        DipsThemeOptionsModule,
    
        // Modulos Principales
        LayoutModule,
        PrincipalModule,
        SesionModule,
      
        FlexLayoutModule.withConfig({ssrObserveBreakpoints: ['xs', 'lt-md']}),
               provideAuth(() => getAuth()),
               provideDatabase(() => getDatabase()),
               provideFirestore(() => getFirestore()),
               provideMessaging(() => getMessaging()),

  ],

  providers: [
    { provide: LOCALE_ID, useValue: 'es-Ar' },    
    AutentificacionService,
    SesionGuard,
    DipsUsuarioService,
    DipsParametroService,
    DipsAppUpdateService,
    
    UserTrackingService,
    ScreenTrackingService,
    PerformanceMonitoringService,
    { provide: FIRESTORE_SETTINGS, useValue: { ignoreUndefinedProperties: true } },
    { provide: ANALYTICS_DEBUG_MODE, useValue: true },
    { provide: COLLECTION_ENABLED, useValue: true },
    // { provide: USE_AUTH_EMULATOR, useValue: environment.useEmulators ? ['http://localhost:9099'] : undefined },
    // { provide: USE_DATABASE_EMULATOR, useValue: environment.useEmulators ? ['localhost', 9000] : undefined },
    // { provide: USE_FIRESTORE_EMULATOR, useValue: environment.useEmulators ? ['localhost', 8080] : undefined },
    // { provide: USE_FUNCTIONS_EMULATOR, useValue: environment.useEmulators ? ['localhost', 5001] : undefined },
    // { provide: USE_STORAGE_EMULATOR, useValue: environment.useEmulators ? ['localhost', 9199] : undefined },
    { provide: REMOTE_CONFIG_SETTINGS, useFactory: () => isDevMode() ? { minimumFetchIntervalMillis: 10_000 } : {} },
    { provide: REMOTE_CONFIG_DEFAULTS, useValue: { background_color: 'red' } },
    { provide: USE_DEVICE_LANGUAGE, useValue: true },
    // { provide: VAPID_KEY, useValue: environment.vapidKey },
    { provide: SERVICE_WORKER, useFactory: () => typeof navigator !== 'undefined' && navigator.serviceWorker?.register('firebase-messaging-sw.js', { scope: '__' }) || undefined },
    { provide: APP_VERSION, useValue: '0.0.0' },
    { provide: APP_NAME, useValue: 'Angular' },
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }