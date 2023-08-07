using Microsoft.AspNetCore.Mvc;
using CardsAngular.Data;
using System.Text.Json;
using Microsoft.AspNetCore.Cors;

namespace CardsAngular.Controllers;

[ApiController]
[Route("api/[controller]")]
public class UserController : ControllerBase
{
    private readonly UserService userService;
    private readonly RoomService roomService;
    private readonly ILogger<UserController> logger;

    public UserController(UserService userService, RoomService roomService, ILogger<UserController> logger)
    {
        this.userService = userService;
        this.roomService = roomService;
        this.logger = logger;
    }

    [HttpGet]
    public async Task<IEnumerable<User>> Index()
    {
        return await userService.GetAllUsersAsync();
    }

    [HttpGet("checkUsername/{username}")]
    [EnableCors]
    public async Task<bool> CheckUsername(string username)
    {
        return await userService.CheckNameUniqueness(username);
    }

    [HttpGet("checkUserExistence/{guid}")]
    public async Task<bool> CheckUserExistence(string guid)
    {
        return await userService.CheckUserExistence(Guid.Parse(guid));
    }

    [HttpPost("~/api/addUser")]
    public async Task<string> AddUser([FromBody] string username)
    {
        Console.WriteLine($"{DateTime.Now}: /api/addUser/{username}");
        try
        {
            if(!await userService.CheckNameUniqueness(username)) throw new Exception("Username already taken");
            // Console.WriteLine("AddUser { username: " + username  + " }");
            Guid userGuid = await userService.Login(username);
            return JsonSerializer.Serialize(userGuid);
        }
        catch(Exception e)
        {
            Console.WriteLine("Error for username: \"" + username + "\": " + e.Message);
            throw e;
        }
    }
}
