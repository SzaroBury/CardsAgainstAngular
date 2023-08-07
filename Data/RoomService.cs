using CardsAngular.Hubs;
using Microsoft.AspNetCore.SignalR;

namespace CardsAngular.Data
{
    public class RoomService
    {
        private List<Room> rooms = new List<Room>();
        private readonly IHubContext<RoomHub> roomHub;

        public RoomService(IHubContext<RoomHub> roomHub)
        {
            this.roomHub = roomHub;
        }

        public Task<List<Room>> GetAllRoomsAsync()
        {
            return Task.FromResult(rooms);
        }

        public Task<Room> GetRoomAsync(Guid id)
        {
            Room? room = rooms.Find(r => r.Guid == id);
            if (room == null) throw new KeyNotFoundException();
            return Task.FromResult(room);
        }
        
        public Task<bool> CheckRoomExistence(Guid room_id)
        {
            return Task.FromResult(rooms.Exists(r => r.Guid == room_id));
        }

        public async Task<bool> UserJoinAsync(Guid roomId, User user)
        {
            var index = rooms.FindIndex(r => r.Guid == roomId);
            if (index == -1) return await Task.FromResult(false);
            
            rooms[index].Users.Add(user);
            return await Task.FromResult(true);
        }

        public async Task<Game> NewGameAsync(Guid roomId, int cardsInHand, int scoreToWin, List<Sentence>? sentences = null, List<Card>? cards = null)
        {
            var index = rooms.FindIndex(r => r.Guid == roomId);
            if(index == -1) throw new KeyNotFoundException();
            if(sentences == null) sentences = rooms[index].Sentences;
            if(cards == null) cards = rooms[index].Cards;
            Game newGame = new Game(roomId, rooms[index].Sentences, rooms[index].Cards, cardsInHand, scoreToWin);

            //check for number of cards
            if (rooms[index].Users.Count * cardsInHand > newGame.GameCards.Count) return null!;

            foreach (var user in rooms[index].Users)
            {
                Player newPlayer = new Player(user)
                {
                    RoomId = rooms[index].Guid,
                };
                for (int i = 0; i < cardsInHand; i++)
                {
                    if(newGame.GameCards.Count > 0)
                    {
                        newPlayer.Hand.Add(newGame.GameCards[0]);
                        newGame.GameCards.RemoveAt(0);
                    }
                }
                newGame.Players.Add(newPlayer);
            }

            //random chooser
            //newGame.ChooserId = _rooms[index].Players[Random.Shared.Next(0, _rooms[index].Players.Count - 1)].Id;

            //first player as chooser
            newGame.ChooserId = rooms[index].Users[0].Id;

            rooms[index].Game = newGame;
            rooms[index].State = RoomState.Ingame;

            return await Task.FromResult(rooms[index].Game!);
        }

        public Task<Room> AddRoomAsync(string roomName, Guid userId, string userName, int maxPlayers)
        {
            if (rooms.Exists(r => r.Name == roomName)) throw new Exception("Room name already taken.");

            var room = new Room()
            {
                Guid = Guid.NewGuid(),
                Name = roomName,
                OwnerGuid = userId,
                OwnerName = userName,
                MaxPlayers = maxPlayers,
                State = RoomState.New
            };
            rooms.Add(room);

            Console.WriteLine($"{DateTime.Now}: RoomService - {roomName} succesfully added");
            return Task.FromResult(room);
        }

        public Task<Room> SendAnswerAsync(Guid roomId, Guid playerId, List<Card> cards)
        {
            var roomIndex = rooms.FindIndex(r => r.Guid == roomId);
            if (roomIndex == -1) throw new InvalidDataException("A room with the given id was not found.");
            if (rooms[roomIndex].Game == null) throw new Exception("Game object does not exists.");

            var playerIndex = rooms[roomIndex].Users.FindIndex(r => r.Id == playerId);
            if (playerIndex == -1) throw new InvalidDataException("A user with the given id was not found in the room.");
            if(rooms[roomIndex].Game!.ChosenCards.Exists( cc => cc.PlayerId == playerId )) throw new InvalidDataException("The user with the given id already sent his answer.");

            int newId = 0;
            while(rooms[roomIndex].Game!.ChosenCards.Exists(cc => cc.Id == newId))
            {
                newId++;
                if(newId > 100) throw new Exception("Inf loop probably");
            }
            rooms[roomIndex].Game!.ChosenCards.Add(new ChosenCards(newId, playerId, cards));
            
            foreach(var card in cards)
            {
                rooms[roomIndex].Game!.Players[playerIndex].Hand.Remove(card);
            }

            //if all players picked
            if(rooms[roomIndex].Game!.ChosenCards.Count == rooms[roomIndex].Game!.Players.Count - 1)
            {
                rooms[roomIndex].Game!.State = GameState.ShowCards;
            }

            return Task.FromResult(rooms[roomIndex]);
        }

        public Task<Game> SendAnswerChooserAsync(Guid roomId, Guid playerId, int cardSetId)
        {
            var roomIndex = rooms.FindIndex(r => r.Guid == roomId);
            if (roomIndex == -1) throw new InvalidDataException("A room with the given id was not found.");
            if (rooms[roomIndex].Game == null) throw new Exception("Game object does not exists.");

            var playerIndex = rooms[roomIndex].Users.FindIndex(r => r.Id == playerId);
            if (playerIndex == -1) throw new InvalidDataException("A user with the given id was not found in the room.");

            var cardsIndex = rooms[roomIndex].Game!.ChosenCards.FindIndex(cc => cc.Id == cardSetId);
            if (cardsIndex == -1) throw new InvalidDataException("A card set with the given id was not found.");
            
            var winnerCardSet = rooms[roomIndex].Game!.ChosenCards[cardsIndex];
            winnerCardSet.Winner = true;
            rooms[roomIndex].Game!.ChosenCards[cardsIndex] = winnerCardSet;

            var winnerPlayerIndex = rooms[roomIndex].Game!.Players.FindIndex(p => p.Id == rooms[roomIndex].Game!.ChosenCards[cardsIndex].PlayerId);
            rooms[roomIndex].Game!.Players[winnerPlayerIndex].Score++;
            
            if(!rooms[roomIndex].Game!.Players.Any(p => p.Score == rooms[roomIndex].Game!.ScoreToWin))
            {
                rooms[roomIndex].Game!.State = GameState.ShowWinnerCards;
            }
            else
            {
                rooms[roomIndex].Game!.State = GameState.Finished;
                rooms[roomIndex].State = RoomState.Finished;
            }

            return Task.FromResult(rooms[roomIndex].Game!);
        }

        public Task<Game> NewRoundAsync(Guid roomId)
        {
            var roomIndex = rooms.FindIndex(r => r.Guid == roomId);
            if (roomIndex == -1) return null!;
            if (rooms[roomIndex].Game == null) return null!;

            //new cards for players
            for (int i = 0; i < rooms[roomIndex].Game!.CurrentSentence.BlankFields; i++)
            {
                foreach(var pl in rooms[roomIndex].Game!.Players)
                {
                    if (rooms[roomIndex].Game!.GameCards.Count == 0)
                    {
                        //take all cards and copy to gamecards
                        rooms[roomIndex].Game!.GameCards = rooms[roomIndex].Cards.OrderBy(key => Random.Shared.Next()).ToList();

                        //remove cards that players already have
                        foreach (var p in rooms[roomIndex].Game!.Players)
                        {
                            foreach (var c in p.Hand)
                            {
                                rooms[roomIndex].Game!.GameCards.Remove(c);
                            }
                        }
                    }

                    if(pl.Id != rooms[roomIndex].Game!.ChooserId)
                    {
                        pl.Hand.Add(rooms[roomIndex].Game!.GameCards[0]);
                        rooms[roomIndex].Game!.GameCards.RemoveAt(0);
                    }
                }
            }

            //new chooser
            var chooserIndex = rooms[roomIndex].Game!.Players.FindIndex(p => p.Id == rooms[roomIndex].Game!.ChooserId);
            if(chooserIndex == rooms[roomIndex].Game!.Players.Count - 1)
            {
                rooms[roomIndex].Game!.ChooserId = rooms[roomIndex].Users[0].Id;
            }
            else
            {
                rooms[roomIndex].Game!.ChooserId = rooms[roomIndex].Users[chooserIndex + 1].Id;
            }

            //new sentence
            if(rooms[roomIndex].Game!.GameSentences.Count == 0)
            {
                rooms[roomIndex].Game!.GameSentences = rooms[roomIndex].Sentences.OrderBy(key => Random.Shared.Next()).ToList();
                var sentenceIndex = rooms[roomIndex].Game!.GameSentences.FindIndex(s => s.Id == rooms[roomIndex].Game!.CurrentSentence.Id);
                rooms[roomIndex].Game!.GameSentences.RemoveAt(sentenceIndex);
                
            }

            rooms[roomIndex].Game!.CurrentSentence = rooms[roomIndex].Game!.GameSentences[0];
            rooms[roomIndex].Game!.GameSentences.RemoveAt(0);
            

            //other simple fields
            rooms[roomIndex].Game!.Round++;
            rooms[roomIndex].Game!.State = GameState.PickCards;
            rooms[roomIndex].Game!.ChosenCards.Clear();

            return Task.FromResult(rooms[roomIndex].Game!);
        }
    
        public Task<bool> AddCardAsync(Guid roomId, string cardValue)
        {
            var roomIndex = rooms.FindIndex(r => r.Guid == roomId);
            if (roomIndex == -1) return Task.FromResult(false);

            int newCardId = rooms[roomIndex].Cards.OrderByDescending(c => c.Id).FirstOrDefault().Id + 1;
            rooms[roomIndex].Cards.Add(new Card { Id = newCardId, Value = cardValue });

            return Task.FromResult(true);
        }

        public Task<bool> RemoveCardAsync(Guid roomId, int cardId)
        {
            var roomIndex = rooms.FindIndex(r => r.Guid == roomId);
            if (roomIndex == -1) return Task.FromResult(false);

            var cardIndex = rooms[roomIndex].Cards.FindIndex(c => c.Id == cardId);
            if (cardIndex == -1) return Task.FromResult(false);
            rooms[roomIndex].Cards.RemoveAt(cardIndex);

            return Task.FromResult(true);
        }

        public async Task<bool> LoadCardsAsync(Guid roomId, Stream stream)
        {
            var roomIndex = rooms.FindIndex(r => r.Guid == roomId);
            if (roomIndex == -1)
            {
                return false;
            }

            StreamReader streamReader = new StreamReader(stream);
            string temp = await streamReader.ReadToEndAsync();


            using (StringReader reader = new StringReader(temp))
            {
                string? line = reader.ReadLine();
                while (line != null)
                {
                    if(!rooms[roomIndex].Cards.Exists(c => c.Value == line))
                    {
                        int newId = rooms[roomIndex].Cards.OrderByDescending(c => c.Id).FirstOrDefault().Id + 1;
                        rooms[roomIndex].Cards.Add(new Card { Id = newId, Value = line.Trim() });
                    }
                    line = reader.ReadLine();
                }
            }

            return true;
        }

        public Task<bool> ClearCardsAsync(Guid roomId)
        {
            var roomIndex = rooms.FindIndex(r => r.Guid == roomId);
            if (roomIndex == -1)
            {
                return Task.FromResult(false);
            }

            rooms[roomIndex].Cards.Clear();
            return Task.FromResult(true);
        }

        public Task<bool> AddSentenceAsync(Guid roomId, string newSentenceValue, int newSentenceBlanks)
        {
            var roomIndex = rooms.FindIndex(r => r.Guid == roomId);
            if (roomIndex == -1) return Task.FromResult(false);

            int newSentenceId = rooms[roomIndex].Sentences.OrderByDescending(c => c.Id).FirstOrDefault().Id + 1;
            rooms[roomIndex].Sentences.Add(new Sentence { Id = newSentenceId, Value = newSentenceValue, BlankFields = newSentenceBlanks });

            return Task.FromResult(true);
        }

        public Task<bool> RemoveSentenceAsync(Guid roomId, int sentenceId)
        {
            var roomIndex = rooms.FindIndex(r => r.Guid == roomId);
            if (roomIndex == -1) return Task.FromResult(false);

            var sentenceIndex = rooms[roomIndex].Sentences.FindIndex(c => c.Id == sentenceId);
            if (sentenceIndex == -1) return Task.FromResult(false);
            rooms[roomIndex].Sentences.RemoveAt(sentenceIndex);

            return Task.FromResult(true);
        }

        public async Task<bool> LoadSentencesAsync(Guid roomId, Stream stream)
        {
            var roomIndex = rooms.FindIndex(r => r.Guid == roomId);
            if (roomIndex == -1)
            {
                return false;
            }

            StreamReader streamReader = new StreamReader(stream);
            string temp = await streamReader.ReadToEndAsync();


            using (StringReader reader = new StringReader(temp))
            {
                string? line = reader.ReadLine();
                while (line != null)
                {
                    var lineSplit = line.Split(";");
                    if(lineSplit[1] == null)
                    {
                        return false;
                    }
                    if (!rooms[roomIndex].Sentences.Exists(c => c.Value == lineSplit[0]))
                    {
                        int newId = rooms[roomIndex].Sentences.OrderByDescending(c => c.Id).FirstOrDefault().Id + 1;
                        rooms[roomIndex].Sentences.Add(new Sentence { Id = newId, Value = lineSplit[0], BlankFields = Convert.ToInt32(lineSplit[1]) });
                    }
                    line = reader.ReadLine();
                }
            }

            return true;
        }

        public Task<bool> ClearSentencesAsync(Guid roomId)
        {
            var roomIndex = rooms.FindIndex(r => r.Guid == roomId);
            if (roomIndex == -1)
            {
                return Task.FromResult(false);
            }

            rooms[roomIndex].Sentences.Clear();
            return Task.FromResult(true);
        }
    
        public void RemoveRoom(Guid roomId)
        {
            var roomIndex = rooms.FindIndex(r => r.Guid == roomId);

            if (roomIndex == -1)  throw new KeyNotFoundException("Room not found");

            rooms.RemoveAt(roomIndex);
        }
    }
}