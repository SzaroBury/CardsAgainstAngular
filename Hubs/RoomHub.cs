using CardsAngular.Data;
using Microsoft.AspNetCore.SignalR;

namespace CardsAngular.Hubs
{
    public class RoomHub : Hub
    {        
        private readonly RoomService roomService;
        private readonly UserService userService;

        public RoomHub(RoomService roomService, UserService userService): base()
        {
            this.roomService = roomService;
            this.userService = userService;
        }

        public async Task Join(string roomGuid, string userGuid)
        {
            Console.WriteLine($"{DateTime.Now}: HUB received Join ({roomGuid}, {userGuid})");
            if(!await userService.CheckUserExistence(Guid.Parse(userGuid)))
            {
                throw new KeyNotFoundException("User with given guid does not exist.");
            }
            if(!await roomService.CheckRoomExistence(Guid.Parse(roomGuid)))
            {
                throw new KeyNotFoundException("Room with given guid does not exist.");
            }
            
            Console.WriteLine($"{DateTime.Now}: HUB sending USER_JOINED ({roomGuid}, {userGuid})");
            await Groups.AddToGroupAsync(Context.ConnectionId, roomGuid);            
            await Clients.Group(roomGuid).SendAsync(WebSocketActions.USER_JOINED, userGuid);
        }

        public async Task Leave(string roomGuid, string userGuid)
        {
            Console.WriteLine($"{DateTime.Now}: HUB received userLeft ({roomGuid}, {userGuid})");
            if(!await userService.CheckUserExistence(Guid.Parse(userGuid)))
            {
                throw new KeyNotFoundException("User with given guid does not exist.");
            }
            if(!await roomService.CheckRoomExistence(Guid.Parse(roomGuid)))
            {
                throw new KeyNotFoundException("Room with given guid does not exist.");
            }

            Console.WriteLine($"{DateTime.Now}: HUB sending USER_LEFT ({roomGuid}, {userGuid})");
            await Groups.RemoveFromGroupAsync(Context.ConnectionId, roomGuid);
            await Clients.Group(roomGuid).SendAsync(WebSocketActions.USER_LEFT, userGuid);
        }


        public async Task CardsConfirmed(string roomGuid, ChosenCards chosenCards)
        {
            Console.WriteLine($"{DateTime.Now}: HUB received CardsConfirmed (roomGuid: {roomGuid}, <ChosenCards object>");
            Room changedRoom = await roomService.SendAnswerAsync(Guid.Parse(roomGuid), chosenCards.PlayerId, chosenCards.Cards);
            if(changedRoom == null) throw new InvalidDataException();

            if(changedRoom.Game?.State == GameState.PickCards)
            {
                Console.WriteLine($"{DateTime.Now}: HUB sending CARDS_CONFIRMED (roomGuid: {roomGuid})");
                await Clients.Group(roomGuid).SendAsync(WebSocketActions.CARDS_CONFIRMED);
            }
            else if(changedRoom.Game?.State == GameState.ShowCards)
            {
                Console.WriteLine($"{DateTime.Now}: HUB sending SHOW_CARDS (roomGuid: {roomGuid}, chosenCards: {changedRoom.Game.ChosenCards.Count} )");
                List<ChosenCards> withoutPlayers = changedRoom.Game.ChosenCards;
                await Clients.Group(roomGuid).SendAsync(WebSocketActions.SHOW_CARDS, withoutPlayers);
            }
        }

        public async Task ChoosedAnswer(string roomGuid, string userGuid, int chosenCardsId)
        {
            Console.WriteLine($"{DateTime.Now}: HUB received ChoosedAnswer (roomGuid: {roomGuid}, userGuid: {userGuid}, <chosenCardsId int>");
            Game changedGame = await roomService.SendAnswerChooserAsync(Guid.Parse(roomGuid), Guid.Parse(userGuid), chosenCardsId);
            if(changedGame == null) throw new InvalidDataException();

            if(changedGame.State == GameState.ShowWinnerCards)
            {
                Console.WriteLine($"{DateTime.Now}: HUB sending SHOW_WINNER (roomGuid: {roomGuid})");
                await Clients.Group(roomGuid).SendAsync(WebSocketActions.SHOW_WINNER, changedGame);
            }
            else if(changedGame.State == GameState.Finished)
            {
                Console.WriteLine($"{DateTime.Now}: HUB sending GAME_FINISHED (roomGuid: {roomGuid})");
                await Clients.Group(roomGuid).SendAsync(WebSocketActions.GAME_FINISHED, changedGame);
            }    
        }

        public async Task NextRound(string roomGuid, string userGuid)
        {
            Console.WriteLine($"{DateTime.Now}: HUB received NextRound (roomGuid: {roomGuid}, userGuid: {userGuid}");
            
            Game changedGame = await roomService.NewRoundAsync(Guid.Parse(roomGuid));
            if(changedGame == null) throw new InvalidDataException();

            Console.WriteLine($"{DateTime.Now}: HUB sending NEXT_ROUND (roomGuid: {roomGuid})");
            await Clients.Group(roomGuid).SendAsync(WebSocketActions.NEXT_ROUND, changedGame);
        }
        
        public async Task NewGame(string roomGuid)
        {
            //newGame based on the old one
            Console.WriteLine($"{DateTime.Now}: HUB received NewGame (roomGuid: {roomGuid})");

            Room room = await roomService.GetRoomAsync(Guid.Parse(roomGuid)); //.NewGameAsync(Guid.Parse(roomGuid), body.CardsInHand, body.ScoreToWin, body.Sentences, body.Cards);
            if(room.Game == null) throw new InvalidOperationException();

            Game game = await roomService.NewGameAsync(Guid.Parse(roomGuid), room.Game.CardsInHand, room.Game.ScoreToWin, room.Sentences, room.Cards);
            await Clients.Group(roomGuid).SendAsync("NewGame", game);

            Console.WriteLine($"{DateTime.Now}: HUB sending NEW_GAME ({roomGuid}, <Game object>)");
            await Clients.Group(roomGuid).SendAsync(WebSocketActions.NEW_GAME, game);
        }

        public async Task SendMessage(string roomId, Message message)
        {
            Console.WriteLine($"{DateTime.Now}: HUB received Send (roomId:{roomId}, <Message object>)");

            Console.WriteLine($"{DateTime.Now}: HUB sending Send (roomId:{roomId}, <Message object>)");
            await Clients.Group(roomId).SendAsync(WebSocketActions.NEW_MESSAGE, message);
        }     
    }

    public struct WebSocketActions
    {
        public static readonly string MESSAGE_RECEIVED = "messageReceived";
        public static readonly string USER_LEFT = "userLeft";
        public static readonly string USER_JOINED = "userJoined";
        public static readonly string NEW_GAME = "newGameStarted";
        public static readonly string CARDS_CONFIRMED = "cardsConfirmed";
        public static readonly string SHOW_CARDS = "showCards";
        public static readonly string SHOW_WINNER = "showWinner";
        public static readonly string NEXT_ROUND = "nextRound";
        public static readonly string GAME_FINISHED = "gameFinished";
        public static readonly string NEW_MESSAGE = "newMessage";

    }
}