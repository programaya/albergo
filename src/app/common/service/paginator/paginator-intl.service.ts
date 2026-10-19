import { MatPaginatorIntl } from '@angular/material/paginator';
import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable()
export class MatPaginatorIntlService implements MatPaginatorIntl {
  changes = new Subject<void>();

  firstPageLabel = 'Primera página';
  itemsPerPageLabel = 'Items por página:';
  lastPageLabel = 'Última página';
  nextPageLabel = 'Página siguiente';
  previousPageLabel = 'Página anterior';

  getRangeLabel(page: number, pageSize: number, length: number): string {
    if (length === 0) {
      return `Página 1 de 1`;
    }
    const amountPages = Math.ceil(length / pageSize);
    return `Página ${page + 1} de ${amountPages}`;
  }
}
