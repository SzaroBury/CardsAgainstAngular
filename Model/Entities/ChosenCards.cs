namespace CardsAngular.Model.Entities;

public class ChosenCards
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid PlayerId { get; set; }
    public List<Card> Cards { get; set; }
    public bool Winner { get; set; } = false;

    public ChosenCards(Guid playerId, List<Card> cards)
    {
        PlayerId = playerId;
        Cards = cards;
    }
}