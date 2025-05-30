using System.Collections.Immutable;
using CardsAngular.Model;
using CardsAngular.Model.DTO;
using CardsAngular.Model.Entities;
using CardsAngular.Model.Enumarations;
using CardsAngular.Services.Contracts;
using Microsoft.AspNetCore.SignalR;

namespace CardsAngular.Hubs
{
    public class RoomHub : Hub
    {
        private static int messageCount = 0;
        private readonly IRoomService roomService;
        private readonly IUserService userService;
        private readonly IGameService gameService;

        public RoomHub(
            IRoomService roomService, 
            IUserService userService,
            IGameService gameService
        ): base()
        {
            this.roomService = roomService;
            this.userService = userService;
            this.gameService = gameService;
        }

        public async Task Join(string roomId, string userId)
        {
            messageCount++;
            Console.WriteLine($"{DateTime.Now}: HUB (#{messageCount}) received Join(roomId: '{roomId}', userId: '{userId}', ContextId: '{Context.ConnectionId}')");

            try 
            {
                var room = await roomService.GetRoomAsync(roomId);
                var user = await userService.GetUserAsync(userId);
                user.ConnectionId = Context.ConnectionId;

                if(!room.Users.Exists(u => u.Id.ToString() == userId))
                {
                    await roomService.UserJoinAsync(room.Id, user);
                }

                messageCount += room.Users.Count;
                Console.WriteLine($"{DateTime.Now}: HUB (#{messageCount}) sending USER_JOINED(roomId: '{roomId}', userId: '{userId}')");
                await Groups.AddToGroupAsync(Context.ConnectionId, roomId);            
                await Clients.Group(roomId).SendAsync(WebSocketActions.USER_JOINED, user);
            }
            catch(Exception e)
            {
                Console.WriteLine($"{DateTime.Now}: HUB Error: {e.Message}");
            }            
        }

        public async Task Leave(string roomId, string userId)
        {
            messageCount++;
            Console.WriteLine($"{DateTime.Now}: HUB (#{messageCount}) received Leave (roomId: '{roomId}', userId: '{userId}')");
            try 
            {
                var room = await roomService.GetRoomAsync(roomId);

                if(room.Users.Exists(u => u.Id.ToString() == userId))
                {
                    var user = await userService.GetUserAsync(userId);
                    Console.WriteLine($"    {DateTime.Now} 3 User's current room is '{user.CurrentRoomId}'");
                    await roomService.UserLeaveWithCheckingOwnerAsync(room.Id, user);
                    Console.WriteLine($"    {DateTime.Now} 5 User's current room is '{user.CurrentRoomId}'");

                    if(room.Users.Count > 0)
                    {
                        messageCount += room.Users.Count;
                        Console.WriteLine($"{DateTime.Now}: HUB (#{messageCount}) sending USER_LEFT (roomId: {roomId}, userId: {userId})");
                        await Clients.Group(roomId).SendAsync(WebSocketActions.USER_LEFT, user);
                        await Groups.RemoveFromGroupAsync(Context.ConnectionId, roomId);            
                    }
                    else 
                    {
                        await roomService.RemoveRoomAsync(roomId);
                    }
                }
                else 
                {
                    throw new KeyNotFoundException("User was not found in the room.");
                }
            }
            catch(Exception e)
            {
                Console.WriteLine($"    {DateTime.Now}: HUB Error: {e.Message}");
            }
        }

        public async Task ConfirmCards(string roomId, ChosenCards chosenCards)
        {
            messageCount++;
            Console.WriteLine($"{DateTime.Now}: HUB (#{messageCount}) received ConfirmCards (roomGuid: '{roomId}', chosenCards.PlayerId: '{chosenCards.PlayerId}',  chosenCards.Cards.Count: {chosenCards.Cards.Count})");
            try
            {
                var room = await roomService.GetRoomAsync(roomId);
                var player = await userService.GetUserAsync(chosenCards.PlayerId);
                var answer = await gameService.SendAnswerAsync(room, player.Id, chosenCards.Cards);

                messageCount += room.Users.Count;
                if(room.Game?.State == GameState.PickingCards)
                {
                    Console.WriteLine($"{DateTime.Now}: HUB (#{messageCount}) sending CARDS_CONFIRMED (roomGuid: '{roomId}')");
                    var answerDTO = new ChosenCardsDTO(answer.Id, answer.PlayerId);
                    await Clients.Group(roomId).SendAsync(WebSocketActions.CARDS_CONFIRMED, answerDTO);
                }
                else if(room.Game?.State == GameState.ShowingCards)
                {
                    Console.WriteLine($"{DateTime.Now}: HUB (#{messageCount}) sending SHOW_CARDS (roomGuid: '{roomId}', answer.Cards.Count: {answer.Cards.Count} )");
                    List<ChosenCards> allAnswers = room.Game.ChosenCards;
                    await Clients.Group(roomId).SendAsync(WebSocketActions.SHOW_CARDS, allAnswers);
                }
            }
            catch(Exception e)
            {
                Console.WriteLine($"{DateTime.Now}: HUB error {e.Message}");
            }
        }

        public async Task ChooseAnswer(string roomId, string userId, string chosenCardsId)
        {
            messageCount++;
            Console.WriteLine($"{DateTime.Now}: HUB (#{messageCount}) received ChoosedAnswer (roomGuid: '{roomId}', userGuid: '{userId}', chosenCardsId: '{chosenCardsId}'");
            try
            {
                var room = await roomService.GetRoomAsync(roomId);
                var player = await userService.GetUserAsync(userId);
                Game changedGame = await gameService.SendAnswerChooserAsync(room, player.Id, chosenCardsId);

                messageCount += room.Users.Count;
                if(changedGame.State == GameState.ShowingWinner)
                {
                    Console.WriteLine($"{DateTime.Now}: HUB (#{messageCount}) sending SHOW_WINNER (roomGuid: {roomId})");
                    await Clients.Group(roomId).SendAsync(WebSocketActions.SHOW_WINNER, chosenCardsId);
                }
                else if(changedGame.State == GameState.Finished)
                {
                    Console.WriteLine($"{DateTime.Now}: HUB (#{messageCount}) sending GAME_FINISHED (roomGuid: {roomId})");
                    await Clients.Group(roomId).SendAsync(WebSocketActions.GAME_FINISHED, chosenCardsId);
                }    
            }
            catch(Exception e)
            {
                Console.WriteLine($"{DateTime.Now}: HUB error {e.Message}");
            }
        }

        public async Task NextRound(string roomId)
        {
            messageCount++;
            Console.WriteLine($"{DateTime.Now}: HUB (#{messageCount}) received NextRound (roomId: {roomId})");
            Console.WriteLine($"    {DateTime.Now}: Current ConnectionId: {Context.ConnectionId}");
            try
            {
                var room = await roomService.GetRoomAsync(roomId);
                Game changedGame = await gameService.NewRoundAsync(room);

                foreach (var player in changedGame.Players)
                {
                    messageCount++;
                    Console.WriteLine($"{DateTime.Now}: HUB (#{messageCount}) sending NEXT_ROUND (roomId: {roomId}) to player '{player.ConnectionId}'");
                    await Clients.Client(player.ConnectionId).SendAsync(
                        WebSocketActions.NEXT_ROUND, 
                        player.Hand,
                        changedGame.CurrentSentence.Id,
                        changedGame.ChooserId
                    );
                    Console.WriteLine($"    {DateTime.Now}: Message sent to {player.ConnectionId}");
                }
            }
            catch(Exception e)
            {
                Console.WriteLine($"{DateTime.Now}: HUB error {e.Message}");
            }
        }
        
        public async Task NewGame(string roomId, int cardsInHand, int scoreToWin)
        {
            messageCount++;
            Console.WriteLine($"{DateTime.Now}: HUB (#{messageCount}) received NewGame (roomGuid: {roomId})");
            try
            {
                var room = await roomService.GetRoomAsync(roomId);
                var newGame = await gameService.NewGameAsync(room, cardsInHand, scoreToWin);
                var playersDto = newGame.Players.Select(p => new PlayerDTO(p.Id, p.Name, p.Score)).AsEnumerable();
                var gameDto = new GameDTO(
                    newGame.RoomId,
                    newGame.Round,
                    newGame.ChooserId,
                    newGame.CardsPerHand,
                    newGame.ScoreToWin,
                    newGame.State,
                    newGame.CurrentSentence,
                    playersDto,
                    []
                );
                
                foreach (var player in newGame.Players)
                {
                    messageCount++;
                    Console.WriteLine($"{DateTime.Now}: HUB (#{messageCount}) sending NEW_GAME (roomGuid: '{roomId}', cardsInHand: '{newGame.CardsPerHand}', scoreToWin: '{newGame.ScoreToWin}', hand: [{player.Hand.Count}], currentSentenceId: '{newGame.CurrentSentence.Id}', chooserId: '{newGame.ChooserId}') to player '{player.ConnectionId}'");

                    await Clients.Client(player.ConnectionId).SendAsync(
                        WebSocketActions.NEW_GAME,
                        gameDto,
                        player.Hand
                    );
                }
            }
            catch(Exception e)
            {
                Console.WriteLine($"{DateTime.Now}: HUB error {e.Message}");
            }
        }

        public async Task SendMessage(string roomId, Message message)
        {
            messageCount++;
            var user = await userService.GetUserAsync(message.UserId);

            Console.WriteLine($"{DateTime.Now}: HUB (#{messageCount}) received Send (roomId: '{roomId}', <Message object>)");
            Console.WriteLine($"{DateTime.Now}:     FROM userId: {user.Id}, userName: {user.Name}, user.ConnectionId {user.ConnectionId}");
            message.Id = Guid.NewGuid().ToString();
            var room = await roomService.GetRoomAsync(roomId);

            messageCount += room.Users.Count;
            Console.WriteLine($"{DateTime.Now}: HUB (#{messageCount}) sending Send (roomId: '{roomId}', <Message object>)");
            await Clients.Group(roomId).SendAsync(WebSocketActions.NEW_MESSAGE, message);
        }     
    }

    public struct WebSocketActions
    {
        public static readonly string USER_JOINED = "userJoined";
        public static readonly string USER_LEFT = "userLeft";
        public static readonly string NEW_GAME = "newGameStarted";
        public static readonly string MESSAGE_RECEIVED = "messageReceived";
        public static readonly string CARDS_CONFIRMED = "cardsConfirmed";
        public static readonly string SHOW_CARDS = "showCards";
        public static readonly string SHOW_WINNER = "showWinner";
        public static readonly string NEXT_ROUND = "nextRoundStarted";
        public static readonly string GAME_FINISHED = "gameFinished";
        public static readonly string NEW_MESSAGE = "newMessage";
        public static readonly string ROOM_REMOVED = "roomRemoved";
    }
}