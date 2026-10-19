import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CajaFormComponent } from './caja-form.component';

describe('CajaFormComponent', () => {
  let component: CajaFormComponent;
  let fixture: ComponentFixture<CajaFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CajaFormComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CajaFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
