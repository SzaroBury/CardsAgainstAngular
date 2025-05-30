import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RoomFooterComponent } from './room-footer.component';

describe('RoomFooterComponent', () => {
  let component: RoomFooterComponent;
  let fixture: ComponentFixture<RoomFooterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RoomFooterComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RoomFooterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
