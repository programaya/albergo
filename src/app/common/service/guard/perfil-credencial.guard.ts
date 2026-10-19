
import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { map, take } from 'rxjs/operators';

import { DipsUsuarioService } from '@serv/usuario/usuario.service'
import { PermisoService } from '../permisos/permiso.service';
import { planPermiso } from '../permisos/plan.permiso';
import { DipsAlertaService } from '@serv/alerta/dips-alerta.service';
import { environment } from '@base/src/environments/environment';


export const PerfilCredencialGuard: CanActivateFn = (route, state) => {
  const usuarioService = inject(DipsUsuarioService);
  const permisoService = inject(PermisoService);
  const alertaService = inject(DipsAlertaService);
  const router = inject(Router);

  return usuarioService.cuenta$.pipe(
    take(1), // Tomamos solo el primer valor emitido (evita suscripciones largas en SSR)
    map(cuenta => {

      if (environment.beta) { return true; } // En entorno beta, permitir todo el acceso

      if (cuenta.plan?.permisos !== undefined &&
        permisoService.tienePermiso(cuenta.plan.permisos, 1)) {
        return true; // Permitir acceso

      } else {
        alertaService.warning('Acceso denegado. Tu plan actual no incluye esta función.', '', 5000, true);
        // Redirigir al login si no está autenticado
        return router.createUrlTree(['/pricing-page'])
      }


    })
  );
};