import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TableroBaseComponent } from './tablero-base.component';

describe('TableroBaseComponent', () => {
  let component: TableroBaseComponent;
  let fixture: ComponentFixture<TableroBaseComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TableroBaseComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TableroBaseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
