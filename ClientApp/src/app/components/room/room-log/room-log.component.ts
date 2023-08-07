import { Component, Input, OnInit } from '@angular/core';
import { HubConnection } from '@microsoft/signalr';
import { Message, Room } from 'src/app/model/Room';
import { User } from 'src/app/model/User';

@Component({
  selector: 'app-room-log',
  templateUrl: './room-log.component.html',
  styleUrls: ['./room-log.component.css']
})
export class RoomLogComponent implements OnInit {
  @Input() room?: Room;
  @Input() userId: string = "";
  @Input() connection?: HubConnection;
  messages: Message[] = [];
  newContent: string = "";
  
  ngOnInit(): void {
    this.addSysMessage("Connected to the room.");
    this.addSysMessage("todo: last best choices | reactions");

    this.connection?.on('newMessage', (message: Message) => 
    {
      console.log("RoomHub: newMessage( userId: " + message.userId + ",  created: " + message.created.toString() + ", content: " + message.content +" )");
      this.messages.push(message);
    });
  }
  
  send()
  {
    const mess = new Message();
    mess.content = this.newContent;
    mess.systemLog = false;
    mess.userId = this.userId;
    if(this.room)
    {
      this.connection?.invoke("SendMessage", this.room.guid, mess);
      this.newContent = "";
    }
  }

  addSysMessage(message: string)
  {
    const mess = new Message();
    mess.content = message;
    mess.systemLog = true;
    this.messages.push(mess);
  }

  calculateMess(mess: Message): string
  {
    if(mess.systemLog)
    {
      return mess.created + "  " + mess.content 
    }
    else
    {
      let name = this.room?.users.find((u: User) => u.id === mess.userId)?.name;
      if(!name) name = "<Unknown>";
      
      return mess.created + "  " + name + ": " + mess.content;
    }
  }

  // dateToString(mess: Message): string
  // {
  //   try
  //   {
  //     if(mess.created instanceof Date)
  //     {
  //       // const formatter = new Intl.DateTimeFormat('en-GB', {
  //       //   hour: '2-digit',
  //       //   minute: '2-digit',
  //       // });
  //       return (mess.created as Date).toLocaleTimeString('en-GB'); //formatter.format(mess.created.getTime());
  //     }
      
  //   }
  //   catch (error: any)
  //   {
  //     console.error("mess(" + mess.content + "): " + error.message)
  //   }
  //   return "-:-";
  // }
}
