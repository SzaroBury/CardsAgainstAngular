namespace CardsAngular.Model;

public record NewSentenceRequest(
    string Content = "",
    int BlankSpaces = 0
);