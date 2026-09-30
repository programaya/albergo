import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PromoBaseComponent } from './promo-base.component';

describe('PromoBaseComponent', () => {
  let component: PromoBaseComponent;
  let fixture: ComponentFixture<PromoBaseComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PromoBaseComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PromoBaseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
