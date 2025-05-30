using CardsAngular.Model.Entities;
using CardsAngular.Services.Contracts;

namespace CardsAngular.Services;
public class UserService: IUserService
{
    private List<User> _users = new List<User>();

    public Task<IEnumerable<User>> GetAllUsersAsync()
    {
        var result = _users.AsEnumerable();
        return Task.FromResult(result);
    }
    public async Task<User> GetUserAsync(string userId)
    {
        if(!Guid.TryParse(userId, out Guid userGuid))
        {
            throw new ArgumentException("The given id is not a valid guid.", "userId");
        }

        return await GetUserAsync(userGuid);
    }
    public Task<User> GetUserAsync(Guid userId)
    {
        User? user = _users.FirstOrDefault(u => u.Id == userId);
        if(user == null) 
        {
            throw new KeyNotFoundException("A user with the given guid does not exists.");
        }

        return Task.FromResult(user);
    }
    public async Task<User> CreateUserAsync(string username)
    {
        if(await IsUsernameTakenAsync(username)) 
            throw new ArgumentException("Username is already taken.");

        User newUser = new(username);
        _users.Add(newUser);

        return newUser;
    }
    public async Task DeleteUserAsync(User user)
    {
        Console.WriteLine($"    {DateTime.Now}: Deleting user: username '{user.Name}', userId '{user.Id}'");
        if(user.CurrentRoomId is not null) 
        {
            await LeaveRoomAsync(user);
        }
        _users.Remove(user);
    }
    public Task<string> GetUserNameAsync(string userId)
    {
        if(!Guid.TryParse(userId, out Guid userGuid))
        {
            Console.WriteLine($"    {DateTime.Now} UserService - The given id is not a valid guid. ('{userId}')");
            throw new ArgumentException("The given id is not a valid guid. ('{userId}')");
        }

        return GetUserNameAsync(userGuid);
    }
    public Task<string> GetUserNameAsync(Guid userId)
    {
        var user = _users.FirstOrDefault(u => u.Id == userId);
        if(user == null) 
        {
            Console.WriteLine($"    {DateTime.Now} UserService - A user with the given guid does not exists. ({userId})");
            throw new KeyNotFoundException($"A user with the given guid does not exists. ({userId})");
        }

        var result = user.Name ?? "";
        return Task.FromResult(result);
    }
    public Task<bool> IsUsernameTakenAsync(string username)
    {
        if(string.IsNullOrEmpty(username))
            throw new ArgumentException("Username cannot be empty.", "username");

        var result = _users.Exists(u => u.Name == username);
        return Task.FromResult(result);
    }
    public async Task<bool> CheckUserExistenceAsync(string userId)
    {
        if(!Guid.TryParse(userId, out Guid userGuid))
            throw new ArgumentException("The given id is not a valid guid.", "userId");

        var result = await CheckUserExistenceAsync(userGuid);
        return result;
    }
    public Task<bool> CheckUserExistenceAsync(Guid userId)
    {            
        var result = _users.ToList().Exists(u => u.Id == userId);
        return Task.FromResult(result);
    }
    public async Task<User> JoinRoomAsync(Guid userId, Guid roomId)
    {
        Console.WriteLine($"    {DateTime.Now}: User '{userId}' is joining room '{roomId}'");
        var user = await GetUserAsync(userId);     
        user.CurrentRoomId = roomId;

        return user;
    }
    public Task<User> LeaveRoomAsync(User user)
    {
        Console.WriteLine($"    {DateTime.Now} 4 User's current room is '{user.CurrentRoomId}'");
        if(user.CurrentRoomId is null)
        {
            throw new KeyNotFoundException("User is not in any room.");
        }

        user.CurrentRoomId = null;
        user.ConnectionId = "";
        return Task.FromResult(user);
    }
    public async Task SetRefreshTokenAsync(Guid userId, string refreshToken) 
    {
        var user = await GetUserAsync(userId);
        user.RefreshToken = refreshToken;
    }
    public async Task<bool> ValidateRefreshTokenAsync(Guid userId, string refreshToken)
    {
        var user = await GetUserAsync(userId);
        return refreshToken == user.RefreshToken;
    }
}