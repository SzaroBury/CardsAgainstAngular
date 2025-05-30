using CardsAngular.Model.Enumarations;

namespace CardsAngular.Model.Entities;

public class Game
{
    public Guid RoomId { get; set; }
    public int Round { get; set; } = 0;
    public Guid ChooserId { get; set; }
    public int CardsPerHand { get; set; }
    public int ScoreToWin { get; set; }
    public GameState State { get; set; } = GameState.PickingCards;
    public Sentence CurrentSentence { get; set; }
    public List<Player> Players { get; set; } = [];
    public List<ChosenCards> ChosenCards { get; set; } = [];
    public List<Sentence> GameSentences { get; set; } = [];
    public List<Card> GameCards { get; set; } = [];

    public Game(Guid roomId, List<Sentence> roomSentences, List<Card> roomCards, int cardsInHand, int scoreToWin)
    {
        RoomId = roomId;
        CardsPerHand = cardsInHand;
        ScoreToWin = scoreToWin;

        Round = 1;
        GameSentences = [.. roomSentences.OrderBy(a => Random.Shared.Next())];
        CurrentSentence = GameSentences.First();
        GameSentences.RemoveAt(0);

        GameCards = [.. roomCards.OrderBy(a => Random.Shared.Next())];
    }

}

