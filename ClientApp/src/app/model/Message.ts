export class Message
{
  id: string = "";
  userId: string = "";
  content: string = "";
  created: string = new Date().toLocaleTimeString();
  systemLog: boolean = false;
}
