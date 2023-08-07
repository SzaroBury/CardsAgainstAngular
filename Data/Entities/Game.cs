namespace CardsAngular.Data
{
    public class Game
    {
        //public int Id { get; set; }
        public Guid RoomId { get; set; }
        public int Round { get; set; } = 0;
        public Guid ChooserId { get; set; }
        public int CardsInHand { get; set; }
        public int ScoreToWin { get; set; }
        public GameState State { get; set; } = GameState.PickCards;
        public Sentence CurrentSentence { get; set; }
        public List<Player> Players { get; set; } = new List<Player>();
        public List<Sentence> GameSentences { get; set; } = new List<Sentence>();
        public List<Card> GameCards { get; set; } = new List<Card>();
        public List<ChosenCards> ChosenCards { get; set; } = new List<ChosenCards>();
        public List<Card> SelectedCards { get; set; } = new();

        public Game(Guid roomId, List<Sentence> roomSentences, List<Card> roomCards, int cardsInHand, int scoreToWin)
        {
            RoomId = roomId;
            CardsInHand = cardsInHand;
            ScoreToWin = scoreToWin;

            GameSentences = roomSentences.OrderBy(a => Random.Shared.Next()).ToList();
            CurrentSentence = GameSentences[0];
            GameSentences.RemoveAt(0);

            GameCards = roomCards.OrderBy(a => Random.Shared.Next()).ToList();
        }
    
    }
    public struct Sentence
    {
        public int Id { get; set; }
        public string Value { get; set; }
        public int BlankFields { get; set; }

        public Sentence(int id, string value, int fields)
        {
            Id = id;
            Value = value;
            BlankFields = fields;
        }
    }

    public struct Card
    {
        public int Id { get; set; }
        public string Value { get; set; }
    
        public Card(int id, string value)
        {
            Id = id;
            Value = value;
        }
    }

    public struct ChosenCards
    {
        public int Id { get; set; }
        public Guid PlayerId { get; set; }
        public List<Card> Cards { get; set; }
        public bool Winner { get; set; }

        public ChosenCards(int id, Guid playerId, List<Card> cards)
        {
            Id = id;
            PlayerId = playerId;
            Cards = cards;
            Winner = false;
        }
    }

    public enum GameState
    {
        PickCards,
        ShowCards,
        ShowWinnerCards,
        Finished
    }
}
