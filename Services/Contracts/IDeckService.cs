using CardsAngular.Model.Entities;
using CardsAngular.Model.DTO;

namespace CardsAngular.Services.Contracts;

public interface IDeckService
{
    public Task<IEnumerable<DeckDTO>> GetAllDecksAsync();
    public Task<Deck> GetDeckAsync(string deckId);
    public Task<DeckDTO> GetDeckDtoAsync(string deckId);
    public Task<DeckDTO> AddDeckAsync(string name, string authorId, string language, IEnumerable<string> sentences, IEnumerable<string> cards);
}