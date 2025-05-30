namespace CardsAngular.Model.Entities;
public class Player : User
{
    public List<Card> Hand { get; set; } = [];
    public int Score { get; set; } = 0;

    public Player(User user) : base(user.Name ?? "??")
    {
        Id = user.Id;
        Name = user.Name ?? "??";
        CurrentRoomId = user.CurrentRoomId;
        ConnectionId = user.ConnectionId;
        RefreshToken = user.RefreshToken;
        IsOld = user.IsOld;
    }
}