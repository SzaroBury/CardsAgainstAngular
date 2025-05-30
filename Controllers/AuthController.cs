using System.Security.Claims;
using CardsAngular.Services.Contracts;
using Microsoft.AspNetCore.Mvc;

namespace CardsAngular.Controllers;

[ApiController]
[Route("api/")]
public class AuthController : ControllerBase
{
    private readonly IUserService userService;
    private readonly IJwtService jwtService;
    private readonly ILogger<UserController> logger;

    public AuthController(IUserService userService, ILogger<UserController> logger, IJwtService jwtService)
    {
        this.userService = userService;
        this.logger = logger;
        this.jwtService = jwtService;
    }

    [HttpPost("/api/login")]
    public async Task<IActionResult> Login([FromBody] string username)
    {
        logger.LogInformation($"{DateTime.Now}: POST /api/login (username: '{username}')");

        var user = await userService.CreateUserAsync(username);
        var accessToken = jwtService.GenerateAccessToken(user.Id.ToString(), username);
        var refreshToken = jwtService.GenerateRefreshToken();

        await userService.SetRefreshTokenAsync(user.Id, refreshToken);

        Response.Cookies.Append("refreshToken", refreshToken, new CookieOptions
        {
            HttpOnly = true,
            Secure = true,
            SameSite = SameSiteMode.None,
            Expires = DateTime.UtcNow.AddHours(2),
        });

        return Ok(new { accessToken });
    }

    [HttpPost("/api/refresh")]
    public async Task<IActionResult> Refresh()
    {
        logger.LogInformation($"{DateTime.Now}: POST /api/refresh");
        
        if (!Request.Cookies.TryGetValue("refreshToken", out var refreshToken))
        {
            throw new InvalidOperationException("No refresh token provided");
        }

        var userId = User.Claims.FirstOrDefault(c => c.Type == ClaimTypes.NameIdentifier)?.Value
            ?? throw new InvalidOperationException("No user provided in claims");

        var user = await userService.GetUserAsync(userId);
        if(user is null || user.Name is null) 
        {
            throw new InvalidOperationException("Username is required");
        }

        if (!await userService.ValidateRefreshTokenAsync(user.Id, refreshToken)) 
        {
            throw new InvalidOperationException($"Invalid refresh token (user's refresh token: {user.RefreshToken}, sent refresh token: {refreshToken})");
        }

        var newAccessToken = jwtService.GenerateAccessToken(userId, user.Name);
        var newRefreshToken = jwtService.GenerateRefreshToken();
        await userService.SetRefreshTokenAsync(user.Id, newRefreshToken);

        Response.Cookies.Append("refreshToken", newRefreshToken, new CookieOptions
        {
            HttpOnly = true,
            Secure = true,
            SameSite = SameSiteMode.None,
            Expires = DateTime.UtcNow.AddHours(2),
        });

        return Ok(new { newAccessToken });
    }

    [HttpPost("/api/logout")]
    public async Task<IActionResult> Logout() 
    {
        logger.LogInformation($"{DateTime.Now}: POST /api/logout");

        Response.Cookies.Delete("refreshToken");

        var userId = User.Claims.FirstOrDefault(c => c.Type == ClaimTypes.NameIdentifier)?.Value
            ?? throw new InvalidOperationException("No user provided in claims");

        var username = User.Claims.FirstOrDefault(c => c.Type == ClaimTypes.Name)?.Value;
        var user = await userService.GetUserAsync(userId);

        await userService.SetRefreshTokenAsync(user.Id, "");
        await userService.DeleteUserAsync(user);

        return Ok();
    }
}