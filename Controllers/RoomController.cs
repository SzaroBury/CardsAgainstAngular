using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using CardsAngular.Data;
using CardsAngular.Hubs;

namespace CardsAngular.Controllers;

[ApiController]
[Route("api/[controller]")]
public class RoomController : ControllerBase
{
    private readonly RoomService roomService;
    private readonly UserService userService;
    private readonly IHubContext<RoomHub> roomHub;
    private readonly ILogger<RoomController> logger;

    public RoomController(RoomService roomSevice, UserService userSevice, IHubContext<RoomHub> roomHub, ILogger<RoomController> logger)
    {
        this.roomService = roomSevice;
        this.userService = userSevice;
        this.roomHub = roomHub;
        this.logger = logger;
    }

    [HttpGet("~/api/rooms")]
    public async Task<IEnumerable<Room>> Index()
    {
        Console.WriteLine($"{DateTime.Now}: GET /api/rooms");
        return await roomService.GetAllRoomsAsync();
    }

    [HttpGet("{id}")]
    public async Task<Room?> GetRoom(string id)
    {
        Console.WriteLine($"{DateTime.Now}: GET /api/room/{id} (id: {id})");
        if(!await roomService.CheckRoomExistence(Guid.Parse(id)))
        {
            throw new KeyNotFoundException("A room with the given guid does not exists.");
        }
        return await roomService.GetRoomAsync(Guid.Parse(id));
    }

    [HttpGet("{roomGuid}/users")]
    public async Task<List<User>> GetRoomUsers([FromRoute] string roomGuid)
    {
        Console.WriteLine($"{DateTime.Now}: GET /api/room/{roomGuid}/users (roomGuid: {roomGuid})");
        if(!await roomService.CheckRoomExistence(Guid.Parse(roomGuid)))
        {
            throw new KeyNotFoundException("A room with the given guid does not exists.");
        }

        Room? room = await roomService.GetRoomAsync(Guid.Parse(roomGuid));
        if(room != null) return room.Users;
        else return new List<User>();
    }

    [HttpPost]
    public async Task<Room> AddRoom([FromBody] AddRoomRequest body)
    {
        Console.WriteLine($"{DateTime.Now}: POST /api/room/AddRoom - (Name: {body.Name}, UserGuid:{body.UserGuid}, MaxPlayers:{body.MaxPlayers})");
        var username = userService.GetUserName(Guid.Parse(body.UserGuid));
        var room = await roomService.AddRoomAsync(body.Name, Guid.Parse(body.UserGuid), username, body.MaxPlayers);
        await UserJoinAsync(room.Guid.ToString(), body.UserGuid);
        return room;
    }

    [HttpPost("{roomGuid}/join")]
    public async Task UserJoinAsync([FromRoute] string roomGuid, [FromBody] string userGuid)
    {
        Console.WriteLine($"{DateTime.Now}: POST /api/room/{roomGuid}/join (user: {userGuid})");
        User? user = await userService.GetUserAsync(Guid.Parse(userGuid));
        if(user == null) throw new KeyNotFoundException("User not found.");

        var result = await roomService.UserJoinAsync(Guid.Parse(roomGuid), user);
        if(!result) throw new KeyNotFoundException();
    }

    [HttpPost("{roomGuid}/NewGame")]
    public async Task NewGameAsync([FromRoute] string roomGuid, [FromBody] NewGameRequest body)
    {
        Console.WriteLine($"{DateTime.Now}: POST /api/room/{roomGuid}/NewGame (CardsInHand: {body.CardsInHand}, ScoreToWin: {body.ScoreToWin}, Sentences({body.Sentences.Count}), Cards({body.Cards.Count}))");
        if(!await roomService.CheckRoomExistence(Guid.Parse(roomGuid)))
        {
            throw new KeyNotFoundException("A room with the given guid does not exists.");
        }
        if(body.Sentences.Count < body.ScoreToWin || body.Cards.Count == 0 ) 
        {
            throw new InvalidDataException();
        }

        Game game = await roomService.NewGameAsync(Guid.Parse(roomGuid), body.CardsInHand, body.ScoreToWin, body.Sentences, body.Cards);
        await roomHub.Clients.Group(roomGuid).SendAsync("NewGame", game);
    }

    [HttpDelete("{roomId}")]
    public void DeleteRoom(string roomId)
    {
        Console.WriteLine($"{DateTime.Now}: DELETE /api/room/{roomId}");
        roomService.RemoveRoom(Guid.Parse(roomId));
    }
}



public record AddRoomRequest
{
    public string Name { get; set; } = "";
    public string UserGuid { get; set; } = "";
    public int MaxPlayers { get; set; } = 5;
}

public record NewGameRequest
{
    public int CardsInHand { get; set; } = -1;
    public int ScoreToWin { get; set; } = -1;
    public List<Sentence> Sentences { get; set; } = new();
    public List<Card> Cards { get; set; } = new();
}



