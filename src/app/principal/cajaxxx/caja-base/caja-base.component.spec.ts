import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CajaBaseComponent } from './caja-base.component';

describe('CajaBaseComponent', () => {
  let component: CajaBaseComponent;
  let fixture: ComponentFixture<CajaBaseComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CajaBaseComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CajaBaseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
