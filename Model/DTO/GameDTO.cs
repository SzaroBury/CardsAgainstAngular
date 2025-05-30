using CardsAngular.Model.Entities;
using CardsAngular.Model.Enumarations;

namespace CardsAngular.Model.DTO;

public record GameDTO(
    Guid RoomId,
    int Round,
    Guid ChooserId,
    int CardsPerHand,
    int ScoreToWin,
    GameState State,
    Sentence CurrentSentence,
    IEnumerable<PlayerDTO> Players,
    IEnumerable<ChosenCardsDTO> ChosenCards
);