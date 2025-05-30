using CardsAngular.Model.Enumarations;

namespace CardsAngular.Model.DTO;

public record DeckDTO(
    Guid Id, 
    string Name,
    string AuthorUsername,
    Language Language,
    IEnumerable<Guid> Sentences,
    IEnumerable<Guid> Cards
);