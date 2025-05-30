namespace CardsAngular.Model;

public record AddSetRequest(
    string Name,
    string UserId,
    string Language,
    IEnumerable<string> Cards,
    IEnumerable<string> Sentences
);