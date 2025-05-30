export class User {
  id: string = '';
  name: string = '';
  joinedRoom: string = '';

  constructor(
    id: string, 
    name: string) {
      this.id = id;
      this.name = name;
  }
}