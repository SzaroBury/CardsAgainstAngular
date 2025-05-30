namespace CardsAngular.Model.Entities;

public class User(string name)
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string Name { get; set; } = name;
    public Guid? CurrentRoomId { get; set; }
    public string ConnectionId { get; set; } = "";
    public string RefreshToken { get; set; } = "";
    public bool IsOld { get; set; } = false;
}