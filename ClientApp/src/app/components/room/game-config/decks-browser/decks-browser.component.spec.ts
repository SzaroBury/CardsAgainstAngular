import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DecksBrowserComponent } from './decks-browser.component';

describe('DecksBrowserComponent', () => {
  let component: DecksBrowserComponent;
  let fixture: ComponentFixture<DecksBrowserComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DecksBrowserComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DecksBrowserComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
