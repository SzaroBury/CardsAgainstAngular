using CardsAngular.Model;
using CardsAngular.Model.DTO;
using CardsAngular.Model.Entities;

namespace CardsAngular.Services.Contracts;

public interface IRoomService
{
    public Task<List<Room>> GetAllRoomsAsync();
    public Task<Room> GetRoomAsync(string roomId);
    public Task<RoomDTO> GetRoomDtoAsync(string roomId);
    public Task<Room> GetRoomAsync(Guid roomId);
    public Task<bool> CheckRoomExistenceAsync(Guid room_id);
    public Task<Room> AddRoomAsync(string roomName, Guid userId, string userName, int maxPlayers);
    public Task RemoveRoomAsync(string roomId);
    public Task<Room> UserJoinAsync(string roomId, User user);
    public Task<Room> UserJoinAsync(Guid roomId, User user);
    public Task<Room> UserLeaveAsync(string roomId, User user);
    public Task<Room> UserLeaveWithCheckingOwnerAsync(Guid roomId, User user);
    public Task<Room> UserLeaveAsync(Guid roomId, User user);
    public Task<Room> LoadDeckAsync(string roomId, string deckId);
    public Task<Room> RemoveDeckAsync(string roomId, string deckId);
    public Task<Room> LoadDecksAsync(string roomId, string[] deckIds);
    public Task<Card> AddCardAsync(string roomId, string cardValue);
    public Task RemoveCardAsync(string roomId, string cardId);
    public Task LoadCardsAsync(string roomId, Stream stream);
    public Task ClearCardsAsync(string roomId);
    public Task<Sentence> AddSentenceAsync(string roomId, string newSentenceValue, int? newSentenceBlanks = 0);
    public Task RemoveSentenceAsync(string roomId, string sentenceId);
    public Task LoadSentencesAsync(string roomId, Stream stream);
    public Task ClearSentencesAsync(string roomId);
}