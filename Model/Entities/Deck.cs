
using CardsAngular.Model.Enumarations;

namespace CardsAngular.Model.Entities;

public class Deck
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string Name { get; set; } = "";
    public string Author { get; set; } = "Unknown";
    public Language Language { get; set; } = Language.English;
    public List<Sentence> Sentences { get; set; } = new List<Sentence>();
    public List<Card> Cards { get; set; } = new List<Card>();
}