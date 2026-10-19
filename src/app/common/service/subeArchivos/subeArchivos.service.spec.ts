import { TestBed } from '@angular/core/testing';

import { SubeArchivosService } from './subeArchivos.service';

describe('SubeArchivosService', () => {
  let service: SubeArchivosService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SubeArchivosService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
