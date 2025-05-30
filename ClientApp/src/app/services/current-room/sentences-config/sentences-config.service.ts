import { Injectable, signal, WritableSignal } from '@angular/core';
import { RoomService } from '../../room/room.service';
import { throwError } from 'rxjs';
import { Room } from 'src/app/model/Room';
import { Sentence } from 'src/app/model/Game';
import { HubConnection } from '@microsoft/signalr';

@Injectable({
  providedIn: 'root'
})
export class SentencesConfigService {
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

  newSentence(content: string): void {
    console.log(`SentencesConfigService.newSentence(content: '${content}')`);

    if(content) {
      let blanks = 0;
      let previous_c = ' ';
      for(let i = 0; i < content.length; i++) {
        if(content[i] == '_' && previous_c != '_') {
          blanks++;
        }
        previous_c = content[i];
      }

      const room = this.room();
      if(room !== null) {
        this.roomService.newSentence(room.id, content, blanks).subscribe({
          next: (newSentence: Sentence) => {
            room.sentences.push(newSentence);
            this.room.set(room);
          },
          error: err => throwError(() => new Error(err))
        });
      }
    }
  }

  removeSentence(sentenceId: string): void {
    console.log(`SentencesConfigService.removeSentence(sentenceId: '${sentenceId}')`);

    const room = this.room();
    if(room !== null) {
      this.roomService.removeSentence(room.id, sentenceId).subscribe({
        next: () => {
          this.room.update(current => ({
            ...current!,
            sentences: current!.sentences.filter(s => s.id !== sentenceId)
          }));
        },
        error: err => throwError(() => new Error(err))
      });
    }
  }

  clearSentences(): void {
    console.log(`SentencesConfigService.clearSentences()`);
    
    let room = this.room();
    if(room !== null) {
      this.roomService.clearSentences(room.id).subscribe({
        next: () => {
          this.room.update(room => ({
            ...room!,
            sentences: []
          }));
        },
        error: err => throwError(() => new Error(err))
      });
    }
  }

  // loadSet(setId: string): void {
  //   console.log(`GameConfigService.loadSet(setId: '${setId}')`);
  //   const room = this.room();
  //   this.roomService.loadSet(room?.id ?? "??", setId).subscribe({
  //     next: (response: Room) => this.room.set(response),
  //     error: err => throwError(() => new Error(err))
  //   })
  // }
}
