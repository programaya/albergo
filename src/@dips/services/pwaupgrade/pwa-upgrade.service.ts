import { Injectable } from '@angular/core';
import { SwUpdate } from '@angular/service-worker';

//import { MatSnackBar } from '@angular/material/snack-bar';
import { interval } from 'rxjs';


@Injectable({
  providedIn: 'root'
})

export class DipsAppUpdateService {
constructor(
    private readonly updates: SwUpdate,

//    private _snackBar: MatSnackBar
    ) {

        if (updates.isEnabled) {
            interval(6 * 60 * 60).subscribe(() => updates.checkForUpdate()
              .then(() => console.log('checking for updates')));
        }
    
    }

    public checkForUpdates(): void {
        this.updates.available.subscribe(event => this.promptUser());
      }
    
      private promptUser(): void {
        console.log('updating to new version');
        this.updates.activateUpdate().then(() => document.location.reload()); 
      }



// begin () {
//   alert("en Service")  
//   this.updates.available.subscribe(event => {
//     this.showAppUpdateAlert();
// });
// }

// showAppUpdateAlert() {

//     this._snackBar.open("App Actualización Disponible","ok", {
//         duration: 5000
//       } )

//     this.doAppUpdate()

// }

// doAppUpdate() {
//     this.updates.activateUpdate().then(() => document.location.reload());
//   }

}

