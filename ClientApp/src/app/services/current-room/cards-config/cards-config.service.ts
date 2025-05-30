import { Injectable, signal, WritableSignal } from '@angular/core';
import { HubConnection } from '@microsoft/signalr';
import { Room } from 'src/app/model/Room';
import { RoomService } from '../../room/room.service';
import { Card } from 'src/app/model/Game';
import { throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CardsConfigService {
  room = signal<Room | null>(null);
  connection : HubConnection | undefined;
  errorMessage = '';

  constructor(
    // private readonly currentRoomService: CurrentRoomService,
    private readonly roomService: RoomService
  ) { }

  setRoom(room: WritableSignal<Room | null>): void {
    this.room = room;
  }

  initWebSocket(connection: HubConnection): void {
    this.connection = connection;
  }

  newCard(content: string): void {
    console.log(`GameConfigService.newCard(content: '${content}')`);

    const room = this.room();
    if(room !== null) {
      this.roomService.newCard(room.id, content).subscribe({
        next: (newCard: Card) => {
          room.cards.push(newCard);
          this.room.set(room);
        },
        error: err => throwError(() => new Error(err))
      });
    }
  }

  removeCard(cardId: string): void {
    console.log(`GameConfigService.removeCard(cardId: '${cardId}')`);

    const room = this.room();
    if(room !== null)
      this.roomService.removeCard(room.id, cardId).subscribe({
        next: () => {
          this.room.update(current => ({
            ...current!,
            cards: current!.cards.filter(s => s.id !== cardId)
          }));
        },
        error: err => throwError(() => new Error(err))
      });
  }

  clearCards(): void {
    console.log(`GameConfigService.clearCards()`);

    const room = this.room();
    if(room !== null) {
      this.roomService.clearCards(room.id).subscribe({
        next: () => {
          this.room.update(current => ({
            ...current!,
            cards: []
          }));
        },
        error: err => throwError(() => new Error(err))
      });
    }
  }
}
