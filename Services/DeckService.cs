using CardsAngular.Model.DTO;
using CardsAngular.Model.Entities;
using CardsAngular.Model.Enumarations;
using CardsAngular.Services.Contracts;

namespace CardsAngular.Services;
public class DeckService: IDeckService
{
    private List<Deck> decks = Seed();

    private static List<Deck> Seed() =>
    [
        new Deck
        {
            Name = "Testing",
            Author = "Default",
            Language = Language.Polish,
            Sentences =
            [
                new Sentence("Test1 _ test _ .", 2),
                new Sentence("Test2 _ test _ .", 2),
                new Sentence("Test3 _ test _ .", 2)
            ],
            Cards =
            [
                new Card("Test1"),
                new Card("Test2"),
                new Card("Test3"),
                new Card("Test4"),
                new Card("Test5")
            ]
        },
        new Deck
        {
            Name = "Testing 2",
            Author = "Default",
            Language = Language.Polish,
            Sentences =
            [
                new Sentence("Test4 _ test _ .", 2),
                new Sentence("Test5 _ test _ .", 2),
                new Sentence("Test6 _ test _ .", 2)
            ],
            Cards =
            [
                new Card("Test6"),
                new Card("Test7"),
                new Card("Test8"),
                new Card("Test9"),
                new Card("Test10")
            ]
        }
    ];

    public async Task<IEnumerable<DeckDTO>> GetAllDecksAsync()
    {
        var deckDTOs = decks.Select(d => 
            new DeckDTO(
                d.Id,
                d.Name,
                d.Author,
                d.Language,
                d.Sentences.Select(s => s.Id),
                d.Cards.Select(c => c.Id)
            )
        );

        return await Task.FromResult(deckDTOs);
    }

    public async Task<DeckDTO> GetDeckDtoAsync(string deckId)
    {
        var deck = await GetDeckAsync(deckId);
        var result = new DeckDTO(
            deck.Id,
            deck.Name,
            deck.Author,
            deck.Language,
            deck.Sentences.Select(s => s.Id),
            deck.Cards.Select(c => c.Id)
        );
        return result;
    }
    
    public async Task<Deck> GetDeckAsync(string deckId)
    {
        if (!Guid.TryParse(deckId, out Guid deckGuid))
        {
            throw new ArgumentException("The given id is not a valid guid.");
        }

        var deck = decks.FirstOrDefault(s => s.Id == deckGuid)
            ?? throw new KeyNotFoundException("Deck with the given ID was not found");

        return await Task.FromResult(deck);
    }

    public async Task<DeckDTO> AddDeckAsync(string name, string author, string language, IEnumerable<string> sentences, IEnumerable<string> cards)
    {
        if (!Enum.TryParse(language, out Language languageEnum))
            throw new ArgumentException("Wrong format of language parameter.");

        if (sentences == null || sentences.ToList().Count == 0)
            throw new ArgumentException("Sentences cannot be empty");

        if (cards == null || cards.ToList().Count == 0)
            throw new ArgumentException("Cards cannot be empty.");

        var newSet = new Deck()
        {
            Name = name,
            Author = author,
            Language = languageEnum,
            Sentences = sentences.Select(s => new Sentence(s)).ToList(),
            Cards = cards.Select(c => new Card(c)).ToList(),
        };
        decks.Add(newSet);
        var result = new DeckDTO(
            newSet.Id,
            newSet.Name,
            newSet.Author,
            newSet.Language,
            newSet.Sentences.Select(s => s.Id),
            newSet.Cards.Select(c => c.Id)
        );
        return await Task.FromResult(result);
    }
}