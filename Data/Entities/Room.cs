namespace CardsAngular.Data
{
    public class Room
    {
        public Guid Guid { get; set; }
        public string? Name { get; set; }

        public Guid OwnerGuid { get; set; }

        public string OwnerName { get; set; } = "";

        public int MaxPlayers { get; set; } = 10;

        public List<User> Users { get; set; } = new List<User>();

        public string PlayersDisplay => string.Format(@"{0}/{1}", Users.Count, MaxPlayers);

        public List<Sentence> Sentences { get; set; } = new List<Sentence>
        {
            new Sentence(0, "Co ____ to ____.", 2),
            new Sentence(1, "____ czy coś.", 1),
            new Sentence(2, "Tak jak wtedy wszyscy ____.", 1)
        };

        public List<Card> Cards { get; set; } = new List<Card>
        {
            new Card(0, "zero"),
            new Card(1, "jeden"),
            new Card(2, "dwa"),
            new Card(3, "trzy"),
            new Card(4, "cztery"),
            new Card(5, "pięć"),
            new Card(6, "sześć"),
            new Card(7, "siedem"),
            new Card(8, "osiem"),
            new Card(9, "dziewięć")
        };

        public RoomState State { get; set; } = RoomState.New;

        public Game? Game { get; set; }

        
    }

    public enum RoomState
    {
        New,
        Ingame,
        Finished
    }

    public struct Message
    {
        public string UserId { get; set; } = "";
        public string Created { get; set; } = "";
        public string Content { get; set; } = "";
        public bool SystemLog { get; set; } = false;

        public Message(string userId, string content, bool systemLog = false, string? created = null)
        {
            UserId = userId;
            Content = content;
            SystemLog = systemLog;
            if( created == null  ) Created = DateTime.Now.ToString("HH:mm:ss");
            else Created = created;
        }

    }
}