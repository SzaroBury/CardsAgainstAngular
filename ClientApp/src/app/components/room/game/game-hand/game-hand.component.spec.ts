import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GameHandComponent } from './game-hand.component';

describe('GameHandComponent', () => {
  let component: GameHandComponent;
  let fixture: ComponentFixture<GameHandComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GameHandComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GameHandComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
