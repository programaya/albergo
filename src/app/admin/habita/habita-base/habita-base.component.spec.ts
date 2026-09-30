import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HabitaBaseComponent } from './habita-base.component';

describe('HabitaBaseComponent', () => {
  let component: HabitaBaseComponent;
  let fixture: ComponentFixture<HabitaBaseComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ HabitaBaseComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HabitaBaseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
