import { Component, OnInit } from '@angular/core';
import { DeckService } from 'src/app/services/deck/deck.service';
import { Deck } from 'src/app/model/Deck';
import { animate, style, transition, trigger } from '@angular/animations';

@Component({
    selector: 'app-decks',
    templateUrl: './decks.component.html',
    styleUrls: ['./decks.component.css'],
    standalone: false,
    animations: [
      trigger('slideToggle', [
        transition(':enter', [ 
          style({ scaleY: '0', opacity: 0, scroll: 'hidden' }),
          animate('300ms ease-out', style({ scaleY: '1', opacity: 1, scroll: 'auto' }))
        ]),
        transition(':leave', [
          animate('300ms ease-in', style({ scaleY: '0', opacity: 0 }))
        ])
      ])
    ]
})
export class DecksComponent implements OnInit {
  decks: Deck[]  = [];
  openedDeckId: string = "";

  constructor(
    private deckService: DeckService,
  ) { }

  ngOnInit() {
    this.deckService.getAllDecks().subscribe({
      next: response => this.decks = response,
      error: e => { console.error("Error during loading decks: " + String(e))}
    })
  }

  browseDeck(id: string) {
    if(this.openedDeckId !== id) {
      this.openedDeckId = id
    } else {
      this.openedDeckId = "";
    }
  }

  noDecksToShow(): boolean {
    return this.decks.length === 0;
  }
}
