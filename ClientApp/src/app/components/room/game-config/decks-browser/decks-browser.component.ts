import { Component, EventEmitter, OnInit, Output, signal, WritableSignal } from '@angular/core';
import { DeckService } from 'src/app/services/deck/deck.service';
import { Deck } from 'src/app/model/Deck';
import { trigger, transition, style, animate } from '@angular/animations';
import { CurrentRoomService } from 'src/app/services/current-room/current-room.service';

@Component({
  selector: 'app-decks-browser',
  templateUrl: './decks-browser.component.html',
  styleUrl: './decks-browser.component.css',
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
export class DecksBrowserComponent implements OnInit {
  @Output() closeDecks = new EventEmitter<void>();
  decks: WritableSignal<Array<Deck>> = signal<Deck[]>([]);
  selectedDecks = signal<string[]>([]);
  openedDeckId = signal("");

  constructor(
    private readonly deckService: DeckService,
    private readonly currentRoomService: CurrentRoomService
  ) {}

  ngOnInit(): void {
    this.deckService.getAllDecks().subscribe({
      next: sets => { 
        this.decks.set(sets);
      }
    });
  }

  browseDeck(id: string): void {
    if(this.openedDeckId() !== id) {
      this.openedDeckId.set(id);
    } else {
      this.openedDeckId.set("");
    }
  }

  checkDeck(id: string): void {
    this.selectedDecks.set([...this.selectedDecks(), id])
  }

  uncheckDeck(id: string): void {
    const filteredSets = this.selectedDecks().filter(s => s !== id);
    this.selectedDecks.set(filteredSets);
  }

  loadDecks(): void {
    this.currentRoomService.loadDecks(this.selectedDecks());
    // this.selectedDecks().forEach(deckId => {
    //   this.currentRoomService.loadDeck(deckId);
    // });
    this.closeDecks.emit();
  }

  cancel(): void {
    this.closeDecks.emit();
  }

  noDecksToShow(): boolean {
    return this.decks().length === 0;
  }
}
