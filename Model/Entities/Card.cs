namespace CardsAngular.Model.Entities;

public class Card
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string Value { get; set; } = "";

    public Card(string value)
    {
        Value = value;
    }
}