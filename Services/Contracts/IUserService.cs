using CardsAngular.Model.Entities;

namespace CardsAngular.Services.Contracts;

public interface IUserService
{
    public Task<IEnumerable<User>> GetAllUsersAsync();
    public Task<User> GetUserAsync(string userId);
    public Task<User> CreateUserAsync(string username);
    public Task DeleteUserAsync(User user);
    public Task<string> GetUserNameAsync(string userId);
    public Task<string> GetUserNameAsync(Guid userId);
    public Task<User> GetUserAsync(Guid userId);
    public Task<bool> IsUsernameTakenAsync(string username);
    public Task<bool> CheckUserExistenceAsync(string userId);
    public Task<bool> CheckUserExistenceAsync(Guid userId);
    public Task<User> JoinRoomAsync(Guid userId, Guid roomId);
    public Task<User> LeaveRoomAsync(User user);
    public Task SetRefreshTokenAsync(Guid userId, string refreshToken);
    public Task<bool> ValidateRefreshTokenAsync(Guid userId, string refreshToken);
}