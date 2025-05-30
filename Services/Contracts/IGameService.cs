using CardsAngular.Model.Entities;

namespace CardsAngular.Services.Contracts;

public interface IGameService
{
    public Task<List<Card>> GetHandAsync(Room room, Guid playerId);
    public Task<Game> NewGameAsync(Room room, int cardsInHand, int scoreToWin);
    public Task<ChosenCards> SendAnswerAsync(Room room, Guid playerId, List<Card> cards);
    public Task<Game> SendAnswerChooserAsync(Room room, Guid playerId, string cardSetId);
    public Task<Game> NewRoundAsync(Room room);
}