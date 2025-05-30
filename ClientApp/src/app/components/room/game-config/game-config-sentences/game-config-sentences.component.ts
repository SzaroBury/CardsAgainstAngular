import { Component, computed } from '@angular/core';
import { CurrentRoomService } from 'src/app/services/current-room/current-room.service';
import { SentencesConfigService } from 'src/app/services/current-room/sentences-config/sentences-config.service';

@Component({
    selector: 'app-game-config-sentences',
    templateUrl: './game-config-sentences.component.html',
    styleUrls: ['./game-config-sentences.component.css'],
    standalone: false
})
export class GameConfigSentencesComponent {
  sentences = computed(() => this.currentRoomService.room()?.sentences);
  newSentenceValue: string = "";
  errorMessage: string = ""

  constructor(
    private readonly currentRoomService: CurrentRoomService,
    private readonly sentencesConfigService: SentencesConfigService
  ) {}

  addSentence(value: string): void {
    this.sentencesConfigService.newSentence(value);
    this.newSentenceValue = '';
  }

  loadSentences(e: any): void {
    let file: File = e.files[0];
    let fileReader = new FileReader();

    fileReader.onload = (event) => {
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

  clearSentences(): void {
    if(confirm("Are you sure you want to delete all sentences?")) {
      this.sentencesConfigService.clearSentences();
    }
  }

  saveSentences(): void {
    //todo
  }

  removeSentence(sentenceId: string): void {
    this.sentencesConfigService.removeSentence(sentenceId);
  }

  isEnoughSentencesForTargetScore(): boolean { 
    const sentencesCount = this.sentences()?.length ?? 0;
    const scoreToWin = this.currentRoomService.scoreToWin();
    return sentencesCount > 0 && sentencesCount >= scoreToWin;
  }
}
