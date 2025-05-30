using CardsAngular.Model;
using CardsAngular.Model.DTO;
using CardsAngular.Model.Entities;
using CardsAngular.Model.Enumarations;
using CardsAngular.Services.Contracts;

namespace CardsAngular.Services;

public class RoomService : IRoomService
{
    private readonly IUserService userService;
    private readonly IDeckService deckService;
    public RoomService(IUserService userService, IDeckService deckService)
    {
        this.userService = userService;
        this.deckService = deckService;
    }

    private List<Room> rooms = [];

    public Task<List<Room>> GetAllRoomsAsync()
    {
        return Task.FromResult(rooms);
    }

    public async Task<RoomDTO> GetRoomDtoAsync(string roomId)
    {
        var room = await GetRoomAsync(roomId);
        var users = room.Users.Select(u => new UserDTO(u.Id, u.Name)).ToList();
        var decks = room.Decks.Select(d => new DeckDTO(
            d.Id, d.Name, d.Author, d.Language,
            d.Sentences.Select(s => s.Id),
            d.Cards.Select(c => c.Id))
        ).ToList();
        GameDTO? game = null;
        if (room.Game is not null)
        {
            var players = room.Game.Players.Select(p => new PlayerDTO(p.Id, p.Name, p.Score));
            var chosenCards = room.Game.ChosenCards.Select(cc => new ChosenCardsDTO(cc.Id, cc.PlayerId)).ToList();
            var Game = new GameDTO(
                room.Id,
                room.Game.Round,
                room.Game.ChooserId,
                room.Game.CardsPerHand,
                room.Game.ScoreToWin,
                room.Game.State,
                room.Game.CurrentSentence,
                players,
                chosenCards
            );
        }

        var roomDto = new RoomDTO(
            room.Id,
            room.Name,
            room.OwnerId,
            room.OwnerName,
            room.MaxPlayers,
            users,
            room.BannedUsers,
            decks,
            room.Sentences,
            room.Cards,
            room.State,
            game
        );

        return roomDto;
    }

    public async Task<Room> GetRoomAsync(string roomId)
    {
        if (!Guid.TryParse(roomId, out Guid roomGuid))
            throw new ArgumentException("The given id is not a valid guid.");

        return await GetRoomAsync(roomGuid);
    }

    public Task<Room> GetRoomAsync(Guid roomId)
    {
        Room? room = rooms.FirstOrDefault(r => r.Id == roomId);
        if (room == null)
            throw new KeyNotFoundException("A room with the given guid does not exists.");

        return Task.FromResult(room);
    }

    public Task<Room> AddRoomAsync(string roomName, Guid userId, string userName, int maxPlayers)
    {
        if (rooms.Exists(r => r.Name == roomName))
            throw new ArgumentException("Room name already taken.", "roomName");

        if (maxPlayers < 3)
            throw new ArgumentException("The maxPlayers parameter is too small. You cant play the game with less then 3 players.", "maxPlayers");

        var room = new Room()
        {
            Id = Guid.NewGuid(),
            Name = roomName,
            OwnerId = userId,
            OwnerName = userName,
            MaxPlayers = maxPlayers,
            State = RoomState.New
        };
        rooms.Add(room);

        Console.WriteLine($"    {DateTime.Now}: RoomService - {roomName} succesfully added");
        return Task.FromResult(room);
    }

    public async Task RemoveRoomAsync(string roomId)
    {
        Console.WriteLine($"    {DateTime.Now}: Removing room {roomId}");
        var room = await GetRoomAsync(roomId);
        if (room.Users.Any())
        {
            foreach (User user in room.Users.ToList())
            {
                await UserLeaveAsync(room.Id, user);
            }
        }
        rooms.Remove(room);
    }

    public Task<bool> CheckRoomExistenceAsync(Guid room_id)
    {
        return Task.FromResult(rooms.Exists(r => r.Id == room_id));
    }

    public async Task<Room> UserJoinAsync(string roomId, User user)
    {
        var room = await GetRoomAsync(roomId);
        return await UserJoinAsync(room.Id, user);
    }

    public async Task<Room> UserJoinAsync(Guid roomId, User user)
    {
        var room = await GetRoomAsync(roomId);
        room.Users.Add(user);
        await userService.JoinRoomAsync(user.Id, roomId);
        return room;
    }

    public async Task<Room> UserLeaveAsync(string roomId, User user)
    {
        var room = await GetRoomAsync(roomId);
        return await UserLeaveAsync(room.Id, user);
    }

    public async Task<Room> UserLeaveAsync(Guid roomId, User user)
    {
        Console.WriteLine($"    {DateTime.Now}: User '{user.Name}' leaving room {roomId}");
        var room = await GetRoomAsync(roomId);
        if (!room.Users.Any(u => u.Id == user.Id))
        {
            throw new KeyNotFoundException("There is no such a user in the room.");
        }

        room.Users.Remove(user);
        await userService.LeaveRoomAsync(user);
        return room;
    }

    public async Task<Room> UserLeaveWithCheckingOwnerAsync(Guid roomId, User user)
    {
        var room = await UserLeaveAsync(roomId, user);
        if (room.OwnerId == user.Id)
        {
            if (room.Users.Any())
            {
                room.OwnerId = room.Users.First().Id;
            }
        }

        return room;
    }

    #region Cards
    public async Task<Card> AddCardAsync(string roomId, string cardValue)
    {
        var room = await GetRoomAsync(roomId);
        cardValue = cardValue.Trim();

        if (string.IsNullOrEmpty(cardValue))
        {
            Console.WriteLine($"{DateTime.Now} RoomService raised ArgumentException - Content of the card cannot be empty.");
            throw new ArgumentException("Content of the card cannot be empty.");
        }

        if (room.Cards.Any(c => c.Value == cardValue))
        {
            Console.WriteLine($"{DateTime.Now} RoomService raised ArgumentException - There is already a similar card in the set. ('{cardValue}')");
            throw new ArgumentException($"There is already a similar card in the set. ('{cardValue}')");
        }

        var newCard = new Card(cardValue);
        room.Cards.Add(newCard);

        return newCard;
    }

    public void AddCardIfNotExists(Room room, Card card)
    {
        if (!room.Cards.Any(c => c.Value == card.Value || c.Id == card.Id))
            room.Cards.Add(card);
    }

    public async Task RemoveCardAsync(string roomId, string cardId)
    {
        var room = await GetRoomAsync(roomId);

        if (!Guid.TryParse(cardId, out Guid cardGuid))
            throw new ArgumentException("The given id is not a valid guid.");

        Card? card = room.Cards.FirstOrDefault(c => c.Id == cardGuid);
        if (card == null)
            throw new KeyNotFoundException("There is no such a card in the room.");

        room.Cards.Remove(card);
    }

    public async Task LoadCardsAsync(string roomId, Stream stream)
    {
        StreamReader streamReader = new(stream);
        string content = await streamReader.ReadToEndAsync();

        using (StringReader reader = new(content))
        {
            string? line = reader.ReadLine();
            while (line != null)
            {
                await AddCardAsync(roomId, line);
                line = reader.ReadLine();
            }
        }
    }

    public async Task ClearCardsAsync(string roomId)
    {
        var room = await GetRoomAsync(roomId);
        room.Cards.Clear();
    }
    #endregion

    #region Sentences
    public async Task<Sentence> AddSentenceAsync(string roomId, string newSentenceValue, int? newSentenceBlanks = 0)
    {
        var room = await GetRoomAsync(roomId);
        newSentenceValue = newSentenceValue.Trim();

        if (string.IsNullOrEmpty(newSentenceValue))
        {
            Console.WriteLine($"{DateTime.Now}: RoomService raised ArgumentException - Sentence cannot be empty.");
            throw new ArgumentException("Sentence cannot be empty.");
        }

        if (room.Sentences.Any(s => s.Value == newSentenceValue))
        {
            Console.WriteLine($"{DateTime.Now}: RoomService raised ArgumentException - There is already a similar sentence in the set.");
            throw new ArgumentException("There is already a similar sentence in the set.");
        }

        if (!newSentenceBlanks.HasValue || newSentenceBlanks < 1)
        {
            int floorCount = newSentenceValue.Count(c => c == '_');
            if (floorCount < 1)
            {
                Console.WriteLine($"{DateTime.Now}: RoomService raised ArgumentException - You have to add at least one blank space using _ .");
                throw new ArgumentException("You have to add at least one blank space using _ .");
            }
            else
                newSentenceBlanks = floorCount;
        }

        var newSentence = new Sentence(newSentenceValue, newSentenceBlanks.Value);
        room.Sentences.Add(newSentence);

        return newSentence;
    }

    public void AddSentenceIfNotExists(Room room, Sentence sentence)
    {
        if (!room.Sentences.Any(s => s.Value == sentence.Value || s.Id == sentence.Id))
            room.Sentences.Add(sentence);
    }

    public async Task RemoveSentenceAsync(string roomId, string sentenceId)
    {
        var room = await GetRoomAsync(roomId);

        if (!Guid.TryParse(sentenceId, out Guid sentenceGuid))
            throw new ArgumentException("The given id is not a valid guid.");

        Sentence? sentence = room.Sentences.FirstOrDefault(s => s.Id == sentenceGuid);
        if (sentence == null)
            throw new KeyNotFoundException("There is no such a sentence in the room.");
    }

    public async Task LoadSentencesAsync(string roomId, Stream stream)
    {
        StreamReader streamReader = new(stream);
        string content = await streamReader.ReadToEndAsync();

        using (StringReader reader = new(content))
        {
            string? line = reader.ReadLine();
            while (line != null)
            {
                var lineSplit = line.Split(";");
                int? blanks = Convert.ToInt32(lineSplit[1]);
                await AddSentenceAsync(roomId, lineSplit[0], blanks ?? 0);
                line = reader.ReadLine();
            }
        }
    }

    public async Task ClearSentencesAsync(string roomId)
    {
        var room = await GetRoomAsync(roomId);
        room.Sentences.Clear();
    }

    #endregion
    public async Task<Room> LoadDeckAsync(string roomId, string deckId)
    {
        var room = await GetRoomAsync(roomId);
        var deck = await deckService.GetDeckAsync(deckId);

        if (!room.Decks.Exists(d => d.Id == deck.Id))
        {
            room.Decks.Add(deck);
        }

        foreach (Card c in deck.Cards)
        {
            AddCardIfNotExists(room, c);
        }

        foreach (Sentence s in deck.Sentences)
        {
            AddSentenceIfNotExists(room, s);
        }

        return room;
    }

    public async Task<Room> LoadDecksAsync(string roomId, string[] deckIds)
    {
        var room = await GetRoomAsync(roomId);

        foreach (string deckId in deckIds)
        {
            var deck = await deckService.GetDeckAsync(deckId);

            if (!room.Decks.Exists(d => d.Id == deck.Id))
            {
                room.Decks.Add(deck);
            }

            foreach (Card c in deck.Cards)
            {
                AddCardIfNotExists(room, c);
            }

            foreach (Sentence s in deck.Sentences)
            {
                AddSentenceIfNotExists(room, s);
            }
        }

        return room;
    }
    
    public async Task<Room> RemoveDeckAsync(string roomId, string deckId)
    {
        var room = await GetRoomAsync(roomId);
        var deck = await deckService.GetDeckAsync(deckId);

        if (!room.Decks.Exists(d => d.Id == deck.Id))
        {
            throw new InvalidOperationException("The given deck is not assigned to the room.");
        }

        foreach (Card c in deck.Cards)
        {
            var cardToRemove = room.Cards.FirstOrDefault(rc => rc.Id == c.Id);
            if (cardToRemove != null)
            {
                room.Cards.Remove(cardToRemove);
            }
        }

        foreach (Sentence s in deck.Sentences)
        {
            var sentenceToRemove = room.Sentences.FirstOrDefault(rs => rs.Id == s.Id);
            if (sentenceToRemove != null)
            {
                room.Sentences.Remove(sentenceToRemove);
            }
        }

        room.Decks.Remove(deck);
        return room;
    }
}