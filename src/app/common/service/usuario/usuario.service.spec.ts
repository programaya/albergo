import { TestBed } from '@angular/core/testing';

import { DipsUsuarioService } from '@serv/usuario/usuario.service'

describe('StorageService', () => {
  let service: DipsUsuarioService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DipsUsuarioService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
