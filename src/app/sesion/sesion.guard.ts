import { Injectable } from '@angular/core';

import { CanActivate, 
         CanActivateChild, 
         CanLoad, 
         Route, 
         Router, 
         UrlSegment, 
         ActivatedRouteSnapshot, 
         RouterStateSnapshot, 
         UrlTree } from '@angular/router';

import { Observable } from 'rxjs';
import { take, map, tap } from 'rxjs/operators';

import { AutentificacionService } from './autentificacion.service';
//import { User } from 'firebase';
import { DipsUsuarioService } from './../../@dips/services/usuario.service';



@Injectable({
  providedIn: 'root'
})
export class SesionGuard implements CanActivate, CanActivateChild, CanLoad {

    // Cuenta 
    private cuenta: any;     

    constructor(
        private _authService: AutentificacionService,
        private _dipsUsuarioService: DipsUsuarioService,
        private _router: Router
        ){
                    // Usuario 
        this._dipsUsuarioService.getCuenta().subscribe((cuenta: any) => {
            this.cuenta = cuenta;
        })

        }

    async canActivate(
        next: ActivatedRouteSnapshot,
        state: RouterStateSnapshot) {
            // VIEJO
            // next: ActivatedRouteSnapshot,
            // state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    
                console.log('en GUARD ' + this._authService.userAutentificado())
   
        if (await this._authService.userAutentificado()) {
            return true;

        } else {
            console.log(' va a login ')
            this._router.navigate(['sesion/login']);
            return false;
        }
    }


    async canActivateChild(
        next: ActivatedRouteSnapshot,
        state: RouterStateSnapshot) {
            // next: ActivatedRouteSnapshot,
            // state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {

        if (await this._authService.userAutentificado()) {


//        if (this.cuenta.idCuenta){
            return true;
        } else {
            console.log('canActivateChild va a login')
            this._router.navigate(['sesion/login']);
            return false;

        }  
        // return this._authService.userDato
        //     .pipe(take(1),
        //     map((user: User) => {
        //         if (user) {
        //             return true;
        //         }
        //         this._router.navigate(['/sesion/login']);
        //         return false;
        //     }))
    }

    canLoad(
        route: Route,
        segments: UrlSegment[]): Observable<boolean> | Promise<boolean> | boolean {
            
        return true;
    }

}
