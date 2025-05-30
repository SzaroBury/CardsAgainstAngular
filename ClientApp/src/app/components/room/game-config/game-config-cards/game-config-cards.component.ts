import { Component, computed, input, OnInit } from '@angular/core';
import { CardsConfigService } from 'src/app/services/current-room/cards-config/cards-config.service';
import { CurrentRoomService } from 'src/app/services/current-room/current-room.service';

@Component({
    selector: 'app-game-config-cards',
    templateUrl: './game-config-cards.component.html',
    styleUrls: ['./game-config-cards.component.css'],
    standalone: false
})
export class GameConfigCardsComponent implements OnInit{
  cards = computed(() => this.currentRoomService.room()?.cards);
  isEnoughCards = input(false);
  newCard: string = "";
  errorMessage: string = "";

  constructor(
    private readonly currentRoomService: CurrentRoomService,
    private readonly cardsConfigService: CardsConfigService
  ) {}

  ngOnInit(): void {
  }

  addCard(value: string): void {
    this.cardsConfigService.newCard(value);
    this.newCard = "";
  }

  loadCards(e: any): void {
    let file: File = e.files[0];
    let fileReader = new FileReader();

    fileReader.onload = (event) => {
      if (!event.target) return;
      let contents = event.target.result?.toString();
      if (!contents) return;
      let splitted = contents.split(/\r?\n/);
      splitted.forEach(line => {
        this.addCard(line);
      })
      console.log("fileReader.onload => loadCards()")
    }

    let result = fileReader.readAsText(file);
    console.log("loadCards(" + file.name + "): \n "+ result);
  }

  clearCards(): void {
    if(confirm("Are you sure you want to delete all cards?")) {
      this.cardsConfigService.clearCards();
    }
  }

  saveCards(): void {
    //todo
  }

  removeCard(cardId: string): void {
    this.cardsConfigService.removeCard(cardId);
  }
}
