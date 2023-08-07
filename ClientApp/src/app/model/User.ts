export interface User 
{
  id : string; // uuid
  name : string;
  joinedRooms : JoinedRoom[];
  joinedRoomsChanged : boolean;
}

interface JoinedRoom
{
  id : number;
  name : string;
}
