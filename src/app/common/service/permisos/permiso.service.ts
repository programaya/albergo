// permiso.service.ts
import { Injectable } from '@angular/core';



@Injectable({
  providedIn: 'root'
})
export class PermisoService {

  /**
   * Verifica si un valor de permisos tiene activo un flag específico
   */
  tienePermiso(permisos: number, permiso: number): boolean {

    return (permisos & permiso) !== 0;
  }

  //   /**
  //    * Verifica si tiene **todos** los permisos especificados (AND lógico)
  //    */
  //   tieneTodos(permisos: number, ...permisosRequeridos: PermisoValue[]): boolean {
  //     const mask = permisosRequeridos.reduce((a, b) => a | b, 0);
  //     return (permisos & mask) === mask;
  //   }

  //   /**
  //    * Verifica si tiene **al menos uno** de los permisos (OR lógico)
  //    */
  //   tieneAlguno(permisos: number, ...permisosRequeridos: PermisoValue[]): boolean {
  //     const mask = permisosRequeridos.reduce((a, b) => a | b, 0);
  //     return (permisos & mask) !== 0;
  //   }

  //   /**
  //    * Agrega uno o más permisos a un valor existente
  //    */
  //   agregar(permisos: number, ...nuevos: PermisoValue[]): number {
  //     return nuevos.reduce((acc, p) => acc | p, permisos);
  //   }

  //   /**
  //    * Remueve uno o más permisos
  //    */
  //   quitar(permisos: number, ...aQuitar: PermisoValue[]): number {
  //     return aQuitar.reduce((acc, p) => acc & ~p, permisos);
  //   }

  //   /**
  //    * Obtiene el nombre de los permisos activos
  //    */
  //   getNombres(permisos: number): string[] {
  //     return Object.keys(Permiso)
  //       .filter(key => {
  //         const value = (Permiso as Record<string, number>)[key];
  //         return (permisos & value) !== 0;
  //       });
  //   }

  //   /**
  //    * Verifica si es un plan premium (ejemplo para planes de pago)
  //    */
  //   esPlanPremium(permisos: number): boolean {
  //     return this.tienePermiso(permisos, Permiso.Premium);
  //   }

  //   /**
  //    * Verifica si puede acceder a configuración
  //    */
  //   puedeConfigurar(permisos: number): boolean {
  //     return this.tienePermiso(permisos, Permiso.Configuracion);
  //   }

}