import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GameConfigCardsComponent } from './game-config-cards.component';

describe('GameConfigCardsComponent', () => {
  let component: GameConfigCardsComponent;
  let fixture: ComponentFixture<GameConfigCardsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GameConfigCardsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GameConfigCardsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
