import { Component, Inject, OnInit, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

// COMPONENTES
import { Options, LabelType } from "@angular-slider/ngx-slider";

import { Promociones } from '../../../firebase/datos/promociones/promociones.model';

@Component({
  selector: 'promo-form-dialog',
  templateUrl: './promo-form.component.html',
  styleUrls: ['./promo-form.component.scss'],
  encapsulation: ViewEncapsulation.None
})

export class PromoFormDialogComponent implements OnInit {
  accion: string;
  dato: Promociones;
  datoForm!: FormGroup;
  dialogoTitulo: string;

  // Seleccion
  semana: any;

  // disabled = false;
  // ShowFilter = false;
  // showAll = true;
  // limitSelection = false;
  // selectedItems: Array<any> = [];

  // Slice
  value: number = 0;
  highValue: number = 24;
  horas: Array<number> = [];

//  dia: number;

  options: Options = {
    floor: 0,
    ceil: 31,
    step: 1,
    translate: (value: number, label: LabelType): string => {
      if (value >= 24) {
        if (label == LabelType.Low) {
          this.dato.horas[0] = value - 24
        } else {
          this.dato.horas[1] = value - 24
        }
        return (value - 24) + 'h';

      } else {
        if (label == LabelType.Low) {
          this.dato.horas[0] = value
        } else {
          this.dato.horas[1] = value
        }

        return value + 'h';
      }
    },


    getLegend: (value: number): string => {
      if (value == 24) {
        return '<b>0h</b>';        
      }
      return ''
    },
    getTickColor: (value: number): string => {
      if (value >= 24) {
        return 'red';
      }
      return ''
    },
    showTicks: true
  };

  constructor(
    public matDialogRef: MatDialogRef<PromoFormDialogComponent>,
    @Inject(MAT_DIALOG_DATA) private _data: any,
    private _formBuilder: FormBuilder
  ) {
    // Set the defaults
    this.accion = _data.accion;

    if (this.accion === 'editar') {
      this.dialogoTitulo = 'Editando Promoción';
      this.dato = _data.dato;
    } else {
      this.dialogoTitulo = 'Nueva Promoción';
      this.dato = new Promociones({});
      this.dato.horas =  [this.value, this.highValue];
      this.dato.activo = true;
    }

    this.inicializaForm();

    this.creaForm();
  }

  inicializaForm() {
    this.datoForm = new FormGroup({
      nombre: new FormControl(null),
      permanencia: new FormControl(null),
      importe: new FormControl(null),
      semana: new FormControl(null),
      horas: new FormControl(null),
      activo: new FormControl(null),
      nota: new FormControl(null), 
    });
 
  }

  creaForm() {

    if (this.datoForm) {
      this.datoForm.reset();
    }

    this.datoForm = this._formBuilder.group({
      nombre: [this.dato.nombre],
      permanencia: [this.dato.permanencia],
      importe: [this.dato.importe],
      semana: [this.dato.semana, Validators.required],
      horas: [this.dato.horas],
      activo: [this.dato.activo],
      nota: [this.dato.nota], 
    })
  }

  ngOnInit() {

    this.semana = [
      { id: 0, nombre: 'Domingo' },
      { id: 1, nombre: 'Lunes' },
      { id: 2, nombre: 'Martes' },
      { id: 3, nombre: 'Miercoles' },
      { id: 4, nombre: 'Jueves' },
      { id: 5, nombre: 'Viernes' },
      { id: 6, nombre: 'Sabado' },
    ];

  }


}
