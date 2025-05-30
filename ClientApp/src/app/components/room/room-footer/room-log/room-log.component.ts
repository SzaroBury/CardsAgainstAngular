import { AfterViewChecked, AfterViewInit, Component, computed, ElementRef, ViewChild } from '@angular/core';
import { Message } from 'src/app/model/Room';
import { User } from 'src/app/model/User';
import { CurrentRoomService } from 'src/app/services/current-room/current-room.service';
import { UserService } from 'src/app/services/user/user.service';

@Component({
    selector: 'app-room-log',
    templateUrl: './room-log.component.html',
    styleUrls: ['./room-log.component.css'],
    standalone: false
})
export class RoomLogComponent implements AfterViewChecked, AfterViewInit {
  room = this.currentRoomService.getCurrentRoom();
  messages = this.currentRoomService.messages;
  messagesLength = computed(() => this.messages().length);
  currentUser = this.userService.getCurrentUser('RoomLogComponent');
  @ViewChild('chatBox') chatBox!: ElementRef;
  newContent: string = "";
  private isAtBottom = true;

  constructor(
    private readonly currentRoomService: CurrentRoomService,
    private readonly userService: UserService
  ) {}

  ngAfterViewInit(): void {
    this.chatBox.nativeElement.addEventListener('scroll', () => {
      const el = this.chatBox.nativeElement;
      this.isAtBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 10;
    });
  }

  ngAfterViewChecked(): void {
    if (this.isAtBottom) {
      this.scrollToBottom();
    }
  }
  
  send(): void {
    if(this.room()) {
      if(this.newContent) {
        this.currentRoomService.sendMessage(this.newContent);
        this.newContent = "";
      }
    }
  }

  calculateMess(mess: Message): string {
    if(mess.systemLog) {
      return `${mess.created}: ${mess.content}`;
    } else {
      let name = this.room()?.users.find((u: User) => u.id === mess.userId)?.name;
      if(!name) name = "<Unknown>";
      
      return `${mess.created} ${name}: ${mess.content}`;
    }
  }

  private scrollToBottom() {
    if (this.chatBox) {
      setTimeout(() => {
        const chatDiv = this.chatBox.nativeElement;
        chatDiv.scrollTop = chatDiv.scrollHeight;
      }, 0);
    }
  }
}
