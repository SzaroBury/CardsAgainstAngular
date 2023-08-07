import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RoomLogComponent } from './room-log.component';

describe('RoomLogComponent', () => {
  let component: RoomLogComponent;
  let fixture: ComponentFixture<RoomLogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RoomLogComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RoomLogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
