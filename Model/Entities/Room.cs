using CardsAngular.Model.Enumarations;

namespace CardsAngular.Model.Entities;

public class Room
{
    public Guid Id { get; set; }
    public string? Name { get; set; }
    public Guid OwnerId { get; set; }
    public string OwnerName { get; set; } = "";
    public int MaxPlayers { get; set; } = 10;
    public List<User> Users { get; set; } = [];
    public List<Guid> BannedUsers { get; set; } = [];
    public List<Deck> Decks { get; set; } = [];
    public List<Sentence> Sentences { get; set; } = [];
    public List<Card> Cards { get; set; } = [];
    public RoomState State { get; set; } = RoomState.New;
    public Game? Game { get; set; }    
}