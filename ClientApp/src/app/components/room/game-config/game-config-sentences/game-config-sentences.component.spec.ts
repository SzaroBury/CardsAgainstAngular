import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GameConfigSentencesComponent } from './game-config-sentences.component';

describe('GameConfigSentencesComponent', () => {
  let component: GameConfigSentencesComponent;
  let fixture: ComponentFixture<GameConfigSentencesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GameConfigSentencesComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GameConfigSentencesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
