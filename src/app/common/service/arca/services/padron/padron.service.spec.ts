import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { PadronService, TIPOS_DOCUMENTO } from './padron.service';
import { DatosFiscales } from './padron.service';

describe('PadronService', () => {
    let service: PadronService;
    let httpMock: HttpTestingController;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            providers: [PadronService]
        });

        service = TestBed.inject(PadronService);
        httpMock = TestBed.inject(HttpTestingController);
    });

    afterEach(() => {
        httpMock.verify();
    });

    describe('consultarPorCUIT', () => {
        it('debería consultar con CUIT válido', () => {
            const cuit = '20123456789';
            const mockResponse: DatosFiscales = {
                idPersona: cuit,
                tipoPersona: 'JURIDICA',
                tipoClave: 'CUIT',
                numeroDocumento: cuit,
                razonSocial: 'EMPRESA SA',
                estadoClave: 'ACTIVO',
                actividades: [],
                impuestos: []
            };

            service.consultarPorCUIT(cuit).subscribe(data => {
                expect(data.razonSocial).toBe('EMPRESA SA');
            });

            const req = httpMock.expectOne(service['API_URL']);
            expect(req.request.method).toBe('POST');
            expect(req.request.body.solicitud.tipoDocumento).toBe(TIPOS_DOCUMENTO.CUIT);
            expect(req.request.body.solicitud.nroDocumento).toBe(cuit);
        });

        it('debería rechazar CUIT inválido', () => {
            service.consultarPorCUIT('123').subscribe({
                next: () => fail('Debería haber fallado'),
                error: error => {
                    expect(error).toContain('Formato de CUIT inválido');
                }
            });
        });
    });

    describe('consultarPorDNI', () => {
        it('debería consultar con DNI válido', () => {
            const dni = '25123456';
            const mockResponse: DatosFisicas = {
                idPersona: dni,
                tipoPersona: 'FISICA',
                tipoClave: 'DNI',
                numeroDocumento: dni,
                nombre: 'Juan',
                apellido: 'Pérez',
                estadoClave: 'ACTIVO',
                actividades: [],
                impuestos: []
            };

            service.consultarPorDNI(dni).subscribe(data => {
                expect(data.nombre).toBe('Juan');
            });

            const req = httpMock.expectOne(service['API_URL']);
            expect(req.request.method).toBe('POST');
            expect(req.request.body.solicitud.tipoDocumento).toBe(TIPOS_DOCUMENTO.DNI);
            expect(req.request.body.solicitud.nroDocumento).toBe(dni);
        });
    });

    describe('formatearCUIT', () => {
        it('debería formatear CUIT con guiones', () => {
            expect(service.formatearCUIT('20123456789')).toBe('20-12345678-9');
            expect(service.formatearCUIT('20-12345678-9')).toBe('20-12345678-9');
        });
    });

    describe('formatearDNI', () => {
        it('debería formatear DNI con puntos', () => {
            expect(service.formatearDNI('25123456')).toBe('25.123.456');
            expect(service.formatearDNI('1234567')).toBe('1.234.567');
        });
    });
});