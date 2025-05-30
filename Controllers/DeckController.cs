using Microsoft.AspNetCore.Mvc;
using CardsAngular.Model;
using CardsAngular.Services.Contracts;

namespace CardsAngular.Controllers;

[ApiController]
[Route("api/deck")]
public class DeckController : ControllerBase
{
    private readonly IDeckService deckService;
    private readonly IUserService userService;
    private readonly ILogger<DeckController> logger;

    public DeckController(IDeckService deckService, IUserService userService, ILogger<DeckController> logger)
    {
        this.deckService = deckService;
        this.userService = userService;
        this.logger = logger;
    }

    [HttpGet("/api/decks")]
    public async Task<IActionResult> GetAllDecks()
    {
        logger.LogInformation($"{DateTime.Now}: GET /api/decks");
        var result = await deckService.GetAllDecksAsync();
        return Ok(result);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetDeck(string id)
    {
        logger.LogInformation($"{DateTime.Now}: GET /api/deck/{id}");
        var result = await deckService.GetDeckDtoAsync(id);
        return Ok(result);       
    }

    [HttpPost]
    public async Task<IActionResult> AddDeck([FromBody] AddSetRequest body)
    {
        logger.LogInformation($"{DateTime.Now}: POST /api/deck - (Name: '{body.Name}', UserId: '{body.UserId}', Language: '{body.Language}', body.Sentences.Count: {body.Sentences.ToList().Count}, body.Cards.Count: {body.Cards.ToList().Count}')");
        var user = await userService.GetUserAsync(body.UserId);
        var result = await deckService.AddDeckAsync(body.Name, user.Name ?? "Unknown", body.Language, body.Sentences, body.Cards);
        return Ok(result);
    }
}