namespace CardsAngular.Model;

public record NewGameRequest(
    int CardsInHand = -1,
    int ScoreToWin = -1
);