using Microsoft.AspNetCore.Mvc;
using CardsAngular.Services.Contracts;
using Microsoft.AspNetCore.Authorization;
using CardsAngular.Model.DTO;

namespace CardsAngular.Controllers;

[ApiController]
[Route("api/user")]
public class UserController : ControllerBase
{
    private readonly IUserService userService;
    private readonly ILogger<UserController> logger;

    public UserController(IUserService userService, ILogger<UserController> logger)
    {
        this.userService = userService;
        this.logger = logger;
    }

    [Authorize]
    [HttpGet("/api/users/")]
    public async Task<IActionResult> GetAllUsers()
    {
        logger.LogInformation($"{DateTime.Now}: GET /api/users");
        var result = await userService.GetAllUsersAsync();
        return Ok(result);
    }

    [Authorize]
    [HttpGet("/api/user/{userId}")]
    public async Task<IActionResult> GetUsername(string userId) 
    {
        logger.LogInformation($"{DateTime.Now}: GET /api/user/{userId}");
        var username = await userService.GetUserNameAsync(userId);
        var result = new UsernameDTO(username);
        return Ok(result);
    }

}