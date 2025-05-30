using CardsAngular.Model.Entities;
using CardsAngular.Model.Enumarations;

namespace CardsAngular.Model.DTO;

public record RoomDTO(
    Guid Id,
    string? Name,
    Guid OwnerId,
    string OwnerName,
    int MaxPlayers,
    IEnumerable<UserDTO> Users,
    IEnumerable<Guid> BannedUsers,
    IEnumerable<DeckDTO> Decks,
    IEnumerable<Sentence> Sentences,
    IEnumerable<Card> Cards,
    RoomState State,
    GameDTO? Game
);