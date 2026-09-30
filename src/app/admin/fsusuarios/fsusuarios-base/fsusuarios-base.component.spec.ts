import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FsusuarioBaseComponent } from './fsusuarios-base.component';

describe('FsusuarioBaseComponent', () => {
  let component: FsusuarioBaseComponent;
  let fixture: ComponentFixture<FsusuarioBaseComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FsusuarioBaseComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FsusuarioBaseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
