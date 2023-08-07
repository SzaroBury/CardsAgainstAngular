import { Component, Input, Output, EventEmitter, ChangeDetectorRef } from '@angular/core';
import { HubConnection } from '@microsoft/signalr';
import { Sentence, Card, Game } from 'src/app/model/Game';
import { Room } from 'src/app/model/Room';
import { RoomService } from 'src/app/services/room.service';

//todo: move cards and sentecnces to new components; send each card and sentence to the server on edit; new game; save sentences/cards to file; edit cards and sentences;
@Component({
  selector: 'app-game-config',
  templateUrl: './game-config.component.html',
  styleUrls: ['./game-config.component.css']
})
export class GameConfigComponent {
  @Input() room?: Room;
  @Input() userId: string = "";
  @Input() connection?: HubConnection;
  public newSentenceValue = "";
  public newCard = "";
  public cardsInHand = this.room?.game.cardsInHand || 3;
  public scoreToWin = this.room?.game.cardsInHand || 10;

  constructor(
    private roomService: RoomService
  ) {}

  addSentence(value: string) 
  {
    console.log("addSentence('" + value + "')"); 
    if(this.room && value)
    {
        let newSentenceBlanks = 0;
        let previous_c = ' ';
        for(let i = 0; i < value.length; i++)
        {
          if(value[i] == '_' && previous_c != '_')
          {
              newSentenceBlanks++;
          }
          previous_c = value[i];
        }

        if(newSentenceBlanks > 0)
        {
          let newSentenceId = this.room.sentences.length;
          while (this.room.sentences.some((s: Sentence) => s.id == newSentenceId))
          {
            newSentenceId++;
          }
          let newSentence: Sentence =  {
            id: newSentenceId,
            value: value,
            blankFields: newSentenceBlanks
          }
          this.room.sentences.push(newSentence);
          this.newSentenceValue = "";
        }
    }
  }

  loadSentences(e: any) 
  {
    let file: File = e.files[0];
    let fileReader = new FileReader();

    fileReader.onload = (event) =>
    {
      if (!event.target) return;
      let contents = event.target.result?.toString();
      if (!contents) return;
      let splitted = contents.split(/\r?\n/);
      splitted.forEach(line => {
        this.addSentence(line);
      })
      console.log("fileReader.onload => loadSentences()")
    }

    let result = fileReader.readAsText(file);
    console.log("loadSentences(" + file.name + "): \n "+ result);
  }

  clearSentences() 
  {
    if(confirm("Are you sure you want to delete all sentences?")) 
    {
      console.log("clearSentences()");
      if(this.room) this.room.sentences = [];
    }
  }

  saveSentences() 
  {
    //todo
  }

  removeSentence(indexToDelete: number) 
  {  
    if(this.room) this.room.sentences.splice(indexToDelete, 1);
  }

  addCard(value: string) 
  {
    if(this.room)
    {
      let newCardId = this.room.cards.length;
      while (this.room.cards.some((c: Card) => c.id == newCardId))
      {
        newCardId++;
      }
      let newCard: Card =  {
        id:  newCardId,
        value: value
      }
      this.room.cards.push(newCard);
      this.newCard = "";
    }
  }

  loadCards(e: any) 
  {
    let file: File = e.files[0];
    let fileReader = new FileReader();

    fileReader.onload = (event) =>
    {
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

  clearCards() 
  {
    if(confirm("Are you sure you want to delete all cards?")) 
    {
      console.log("clearCards()");
      if(this.room) this.room.cards = [];
    }
  }

  saveCards() 
  {
    //todo
  }

  removeCard(indexToDelete: number) 
  {
    if(this.room) this.room.cards.splice(indexToDelete, 1);
  }

  newGame()
  {
    console.log("game-room: newGame(" + this.cardsInHand + ", " + this.scoreToWin + ", sentences(" + this.room?.sentences + "), cards(" + this.room?.cards + "))");
    if(this.room && this.startGameConditions())
    {   
      this.roomService
        .newGame(this.room.guid, this.cardsInHand, this.scoreToWin, this.room.sentences, this.room.cards)
        .subscribe();
    }
    else
    {
      alert("Incorrect configuration. The game cannot be started.")
    }
  }

  isEnoughCardsForPlayers(): boolean
  {
    if(this.room)
    {
      return this.room.users.length * this.cardsInHand < this.room.cards.length;
    }
    
    return false
  }

  isEnoughSentencesForTargetScore(): boolean
  { 
    if(this.room)
    {
      return this.room.sentences.length >= this.scoreToWin;
    }

    return false
  }

  startGameConditions(): boolean
  {
    if(this.room)
    {
      return this.room.users.length > 2 
            && this.isEnoughCardsForPlayers()
            && this.isEnoughSentencesForTargetScore();
    }

    return false
  }
}
