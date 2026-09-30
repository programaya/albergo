import { Component, Input, OnDestroy, OnInit, TemplateRef, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormGroup } from '@angular/forms';

// Material
import { MatSort } from '@angular/material/sort';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';


import { dipsAnimations } from '../../../../@dips/animations';
import { DipsConfirmDialogComponent } from '../../../../@dips/components/confirm-dialog/confirm-dialog.component';

import { FsusuarioFormDialogComponent } from '../fsusuarios-form/fsusuarios-form.component';

// Datos
import { UsuariosDatasource } from '../../../firebase/datos/usuarios';
import { UsuariosDatabase } from '../../../firebase/datos/usuarios/usuarios.database';

@Component({
    selector     : 'fsusuarios-list',
    templateUrl  : './fsusuarios-list.component.html',
    styleUrls    : ['./fsusuarios-list.component.scss'],
    encapsulation: ViewEncapsulation.None,
    animations   : dipsAnimations
})
export class FsusuarioListComponent implements OnInit, OnDestroy {
    @Input() source!: UsuariosDatasource;
    @Input() displayedColumns = ['avatar', 'estado', 'nombre', 'email', 'titulo'];
  
    @ViewChild('sort', {static: true}) sort!: MatSort;

    dialogoRef: any;
    confirmaDialogoRef!: MatDialogRef<DipsConfirmDialogComponent>;

    constructor(
        private _usuariosDatabase: UsuariosDatabase,
        public _matDialog: MatDialog
    ) {}

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    /**
     * On init
     */
    ngOnInit() {
        this.source.setSort(this.sort);

    }

    /**
     * On destroy
     */
    ngOnDestroy(): void { }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * editaItem
     */
    editaItem(fila: any) {

        this.dialogoRef = this._matDialog.open(FsusuarioFormDialogComponent, {
            panelClass: 'fsusuario-form-dialog',
            data      : {
                dato: fila,
                estado : fila.estado
            }
        });

        this.dialogoRef.afterClosed()
            .subscribe((response: any) => {
                if ( !response )
                {
                    return;
                }
                const actionType: string = response[0];
                const formData: FormGroup = response[1];

                switch ( actionType ) {

                    case 'salva': // solo salva
                        console.log('salva')
                        const data = formData.getRawValue();
                        this._usuariosDatabase.actualizaDato(fila.id, data);
                        break;

                    case 'elimina':
                        console.log('elimina')
                        this.rechazaUsuario(fila);

                        break;

                    case 'activa':

                        console.log('activa')
                       this.activaUsuario(fila); 
                       break;

                    case 'rechaza':
                        
                    console.log('rechaza')
                        this.rechazaUsuario(fila);
                        break;
                }
            });
    }

    activaUsuario(fila: any){
        fila.estado = 'Activo';
        this._usuariosDatabase.actualizaDato(fila.id, fila);

    }
    rechazaUsuario(fila: any) {

        fila.estado = 'Rechazado';
        this._usuariosDatabase.actualizaDato(fila.id, fila);

    }

}
