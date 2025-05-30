using Microsoft.AspNetCore.Mvc;
using CardsAngular.Services.Contracts;
using CardsAngular.Model;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Cors;
using System.Security.Claims;
using System.Security;

namespace CardsAngular.Controllers;

[Authorize]
[EnableCors]
[ApiController]
[Route("api/room")]
public class RoomController : ControllerBase
{
    private readonly IRoomService roomService;
    private readonly IUserService userService;
    private readonly IGameService gameService;
    private readonly ILogger<RoomController> logger;

    public RoomController(
        IRoomService roomService, 
        IUserService userService, 
        IGameService gameService, 
        IDeckService deckService,
        ILogger<RoomController> logger)
    {
        this.roomService = roomService;
        this.userService = userService;
        this.gameService = gameService;
        this.logger = logger;
    }

    [HttpGet("/api/rooms")]
    public async Task<IActionResult> GetAllRooms()
    {
        logger.LogInformation($"{DateTime.Now}: GET /api/rooms");
        var result = await roomService.GetAllRoomsAsync();
        return Ok(result);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetRoom(string id)
    {
        logger.LogInformation($"{DateTime.Now}: GET /api/room/{id}");
        var result = await roomService.GetRoomAsync(id);
        return Ok(result); 
    }

    [HttpPost("/api/room")]
    public async Task<IActionResult> AddRoom([FromBody] AddRoomRequest body)
    {
        logger.LogInformation($"{DateTime.Now}: POST /api/room - (Name: '{body.Name}', UserId: '{body.UserId}', MaxPlayers: {body.MaxPlayers})");
        var user = await userService.GetUserAsync(body.UserId);
        var room = await roomService.AddRoomAsync(body.Name, user.Id, user.Name ?? "?", body.MaxPlayers);

        return Ok(room);
    }

    [HttpDelete("{roomId}")]
    public async Task<IActionResult> DeleteRoom(string roomId)
    {
        logger.LogInformation($"{DateTime.Now}: DELETE /api/room/{roomId}");
        var userId = User.Claims.FirstOrDefault(c => c.Type == ClaimTypes.NameIdentifier)?.Value;
        if(userId is null) 
        {
            throw new SecurityException("No user provided in claims");
        }

        var room = await roomService.GetRoomAsync(roomId);
        if(room.OwnerId.ToString() != userId) 
        {
            throw new SecurityException("The user is not the owner of the room.");
        }
        
        await roomService.RemoveRoomAsync(roomId);
        return Ok();
    }

    #region Users
    [HttpGet("{roomId}/users")]
    public async Task<IActionResult> GetRoomUsers([FromRoute] string roomId)
    {
        logger.LogInformation($"{DateTime.Now}: GET /api/room/{roomId}/users");
        var result = await roomService.GetRoomAsync(roomId);
        return Ok(result.Users);
    }

    [HttpPost("leave")]
    public async Task<IActionResult> UserLeave()
    {
        logger.LogInformation($"{DateTime.Now}: POST /api/room/leave");
        var userId = User.Claims.FirstOrDefault(c => c.Type == ClaimTypes.NameIdentifier)?.Value;
        if(userId is null) 
        {
            return Unauthorized("No user provided in claims.");
        }
        var user = await userService.GetUserAsync(userId);
        
        if(user.CurrentRoomId is null)
        {
            throw new InvalidOperationException("User is not in any room now.");
        }
        var room = await roomService.UserLeaveWithCheckingOwnerAsync(user.CurrentRoomId.Value, user);
        
        return Ok();
    }
    #endregion
    #region Cards
    [HttpPost("{roomId}/cards")]
    public async Task<IActionResult> NewCard([FromRoute] string roomId, [FromBody] NewCardRequest body)
    {
        logger.LogInformation($"{DateTime.Now}: POST /api/room/{roomId}/cards (Content: '{body.Content}')");
        var result = await roomService.AddCardAsync(roomId, body.Content);
        return Ok(result);
    }

    [HttpDelete("{roomId}/cards/{cardId}")]
    public async Task<IActionResult> RemoveCard([FromRoute] string roomId, [FromRoute] string cardId)
    {
        logger.LogInformation($"{DateTime.Now}: DELETE /api/room/{roomId}/cards/{cardId}");
        await roomService.RemoveCardAsync(roomId, cardId);
        return Ok();
    }

    [HttpDelete("{roomId}/cards")]
    public async Task<IActionResult> ClearCards([FromRoute] string roomId)
    {
        logger.LogInformation($"{DateTime.Now}: DELETE /api/room/{roomId}/cards");
        await roomService.ClearCardsAsync(roomId);
        return Ok();
    }
    #endregion
    #region Sentences
    [HttpPost("{roomId}/sentences")]
    public async Task<IActionResult> NewSentence([FromRoute] string roomId, [FromBody] NewSentenceRequest body)
    {
        Console.WriteLine($"{DateTime.Now}: POST /api/room/{roomId}/sentences (body.Content: '{body.Content}', body.BlankSpaces: {body.BlankSpaces})");
        try
        {
            var result = await roomService.AddSentenceAsync(roomId, body.Content, body.BlankSpaces);
            return Ok(result);
        }
        catch(ArgumentException e)
        {
            return ValidationProblem(e.Message);
        }
        catch(KeyNotFoundException e)
        {
            return NotFound(e.Message);
        }     
        catch(Exception e)
        {
            return StatusCode(500, e.Message);
        }
    }

    [HttpDelete("{roomId}/sentences/{sentenceId}")]
    public async Task<IActionResult> RemoveSentence([FromRoute] string roomId, [FromRoute] string sentenceId)
    {
        Console.WriteLine($"{DateTime.Now}: DELETE /api/room/{roomId}/sentences/{sentenceId}");
        try
        {
            await roomService.RemoveSentenceAsync(roomId, sentenceId);
            return Ok();
        }
        catch(ArgumentException e)
        {
            return ValidationProblem(e.Message);
        }
        catch(KeyNotFoundException e)
        {
            return NotFound(e.Message);
        }     
        catch(Exception e)
        {
            return StatusCode(500, e.Message);
        }
    }

    [HttpDelete("{roomId}/sentences")]
    public async Task<IActionResult> ClearSentence([FromRoute] string roomId)
    {
        Console.WriteLine($"{DateTime.Now}: DELETE /api/room/{roomId}/sentences");
        try
        {
            await roomService.ClearSentencesAsync(roomId);
            return Ok();
        }
        catch(ArgumentException e)
        {
            return ValidationProblem(e.Message);
        }
        catch(KeyNotFoundException e)
        {
            return NotFound(e.Message);
        }     
        catch(Exception e)
        {
            return StatusCode(500, e.Message);
        }
    }
    #endregion

    [HttpPut("{roomId}/load/{deckId}")]
    public async Task<IActionResult> LoadDeck(string roomId, string deckId)
    {
        logger.LogInformation($"{DateTime.Now}: PUT /api/room/{roomId}/load/{deckId}");
        var room = await roomService.LoadDeckAsync(roomId, deckId);
        return Ok(room);
    }

    [HttpPut("{roomId}/remove/{deckId}")]
    public async Task<IActionResult> RemoveDeck(string roomId, string deckId)
    {
        logger.LogInformation($"{DateTime.Now}: PUT /api/room/{roomId}/remove/{deckId}");
        var room = await roomService.RemoveDeckAsync(roomId, deckId);
        return Ok(room);
    }

    [HttpPut("{roomId}/load")]
    public async Task<IActionResult> LoadDecks(string roomId, [FromBody] string[] deckIds)
    {
        logger.LogInformation($"{DateTime.Now}: PUT /api/room/{roomId}/load");
        var room = await roomService.LoadDecksAsync(roomId, deckIds);
        return Ok(room);
    }

    [HttpGet("hand")]
    public async Task<IActionResult> GetPlayersHand()
    {
        logger.LogInformation($"{DateTime.Now}: GET /api/room/hand");
        var playerIdFromToken = User.Claims.FirstOrDefault(c => c.Type == ClaimTypes.NameIdentifier)?.Value
            ?? throw new SecurityException("No player id provided in claims");

        var user = await userService.GetUserAsync(playerIdFromToken);
        if(!user.CurrentRoomId.HasValue)
        {
            throw new InvalidOperationException("User is not in any game right now.");
        }

        var room = await roomService.GetRoomAsync(user.CurrentRoomId.Value);
        var hand = await gameService.GetHandAsync(room, user.Id);
        return Ok(hand);
    }
}