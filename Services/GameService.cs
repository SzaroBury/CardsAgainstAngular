using CardsAngular.Model.Entities;
using CardsAngular.Model.Enumarations;
using CardsAngular.Services.Contracts;

namespace CardsAngular.Services;

public class GameService: IGameService
{
    public Task<List<Card>> GetHandAsync(Room room, Guid playerId)
    {
        var game = room.Game;
        if(game is null)
        {
            throw new ArgumentException("Game object does not exists.");
        }

        var player = game.Players?.Find(p => p.Id == playerId);
        if(player is null)
        {
            throw new ArgumentException("Given player is not in the room.");
        }
        
        return Task.FromResult(player.Hand);         
    }
    public async Task<Game> NewGameAsync(Room room, int cardsInHand, int scoreToWin)
    {
        var sentences = room.Sentences;
        var cards = room.Cards;

        if(sentences == null) 
            sentences = room.Sentences;

        if(cards == null) 
            cards = room.Cards;

        if(sentences == null)
            throw new ArgumentException("You have too few sentences to start the game.");

        if(sentences.ToList().Count < scoreToWin) 
            throw new ArgumentException("You have too few sentences to start the game. Add more sentences or decrease the target score to win.");

        if(room.Users.Count < 3)
            throw new ArgumentException("You have too few players to start the game.");

        if(room.Users.Count * cardsInHand > cards.ToList().Count)
            throw new ArgumentException("You don't have enough cards to start the game.");

        if(sentences.Any(s => s.BlankFields > cardsInHand))
            throw new ArgumentException("You have set too few cards in hand to start the game. Increase the number of cards or remove sentences that have more blank fields than the current setting.");

        Game newGame = new(room.Id, room.Sentences, room.Cards, cardsInHand, scoreToWin);

        foreach (var user in room.Users)
        {
            Player newPlayer = new(user);
            for (int i = 0; i < cardsInHand; i++)
            {
                if(newGame.GameCards.Count > 0)
                {
                    newPlayer.Hand.Add(newGame.GameCards[0]);
                    newGame.GameCards.RemoveAt(0);
                }
            }
            newGame.Players.Add(newPlayer);
        }

        //random chooser
        //newGame.ChooserId = _rooms[index].Players[Random.Shared.Next(0, _rooms[index].Players.Count - 1)].Id;

        //first player as chooser
        newGame.ChooserId = room.Users[0].Id;

        room.Game = newGame;
        room.State = RoomState.Ingame;

        return await Task.FromResult(room.Game);
    }

    public Task<ChosenCards> SendAnswerAsync(Room room, Guid playerId, List<Card> cards)
    {
        var game = room.Game;

        if(room.State != RoomState.Ingame || game == null || game.State != GameState.PickingCards)
            throw new InvalidOperationException("You cannot do this now. You have to start the game first.");

        Player? player = game.Players.FirstOrDefault(r => r.Id == playerId);
        if (player == null) 
            throw new InvalidOperationException("A user with the given id was not found in the room.");

        if(game.ChosenCards.Exists( cc => cc.PlayerId == playerId )) 
            throw new InvalidOperationException("The user with the given id already sent his answer.");

        var chosenCards = new ChosenCards(playerId, cards);
        game.ChosenCards.Add(chosenCards);
        int numberOfRemovedCards = player.Hand.RemoveAll(cardFromHand => cards.Exists(choosedCard => cardFromHand.Id == choosedCard.Id));
        Console.WriteLine($"{DateTime.Now}: GameService.SendAnswerAsync() - numberOfRemovedCards: {numberOfRemovedCards}");

        //if all players picked
        if(game.ChosenCards.Count == game.Players.Count - 1)
        {
            game.State = GameState.ShowingCards;
        }

        return Task.FromResult(chosenCards);
    }

    public Task<Game> SendAnswerChooserAsync(Room room, Guid playerId, string cardSetId)
    {
        var game = room.Game;

        if(room.State != RoomState.Ingame || game == null)
            throw new InvalidOperationException("You cannot do this now. You have to start the game first.");

        Player? player = game.Players.FirstOrDefault(r => r.Id == playerId);
        if (player == null) 
            throw new InvalidOperationException("A user with the given id was not found in the room.");

        if(!Guid.TryParse(cardSetId, out Guid cardSetGuid))
            throw new ArgumentException("The given id is not a valid guid.", "cardSetId");

        ChosenCards? winnerCardSet = game.ChosenCards.FirstOrDefault(cc => cc.Id == cardSetGuid);
        if (winnerCardSet == null) 
            throw new InvalidOperationException("A card set with the given id was not found.");
        winnerCardSet.Winner = true;

        var winner = game.Players.FirstOrDefault(p => p.Id == winnerCardSet.PlayerId);
        if (winner == null) 
            throw new InvalidOperationException("A user with the given id was not found in the room.");
        winner.Score++;
        
        if(game.Players.Any(p => p.Score == game.ScoreToWin))
        {
            game.State = GameState.Finished;
            room.State = RoomState.Finished;
        }
        else
        {
            game.State = GameState.ShowingWinner;
        }

        return Task.FromResult(game);
    }

    public Task<Game> NewRoundAsync(Room room)
    {
        var game = room.Game;

        if(room.State != RoomState.Ingame || game == null)
            throw new InvalidOperationException("You cannot do this now. You have to start the game first.");

        //new cards for players
        for (int i = 0; i < game.CurrentSentence.BlankFields; i++)
        {
            foreach(var pl in game.Players)
            {
                if (game.GameCards.Count == 0)
                {
                    //take all cards that players don't have and copy to gamecards
                    var playersCards = game.Players.SelectMany(p => p.Hand);
                    game.GameCards = room.Cards.Except(playersCards).OrderBy(key => Random.Shared.Next()).ToList();
                }

                if(pl.Id != game.ChooserId)
                {
                    pl.Hand.Add(game.GameCards[0]);
                    game.GameCards.RemoveAt(0);
                }
            }
        }

        //new chooser
        var chooserIndex = game.Players.FindIndex(p => p.Id == game.ChooserId);
        if(chooserIndex == game.Players.Count - 1)
        {
            game.ChooserId = room.Users[0].Id;
        }
        else
        {
            game.ChooserId = room.Users[chooserIndex + 1].Id;
        }

        //new sentence
        if(game.GameSentences.Count == 0)
        {
            game.GameSentences = room.Sentences.OrderBy(key => Random.Shared.Next()).ToList();
            game.GameSentences.Remove(game.CurrentSentence);
        }
        game.CurrentSentence = game.GameSentences[0];
        game.GameSentences.RemoveAt(0);
        

        //other simple fields
        game.Round++;
        game.State = GameState.PickingCards;
        game.ChosenCards.Clear();

        return Task.FromResult(game);
    }
}