namespace CardsAngular.Model;

public record AddRoomRequest(
    string Name = "",
    string UserId = "",
    int MaxPlayers = 5
);