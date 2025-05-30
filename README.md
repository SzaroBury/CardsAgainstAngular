# CardsAgainstAngular
.NET + Angular app that allows users to play Cards Against Humanity.

## Functionalities
- Creating game room
- List of rooms
- Export of cards and sentences to a file
- Import cards and sentences from a file
- Playing the game
- Chat

## Architecture Overview

The project consists of two main parts:
- **Backend:** ASP.NET Core Web API (root folder)
- **Frontend:** Angular (folder `ClientApp`)

### Backend (ASP.NET Core)
- **Controllers/** – API controllers (`RoomController`, `DeckController`, `UserController`, `AuthController`)
- **Services/** – business logic (`RoomService`, `GameService`, `DeckService`, `UserService`)
- **Model/Entities/** – domain entities (`Room`, `Game`, `Player`, `Card`, `Sentence`)
- **Model/DTO/** – Data Transfer Objects for API/SignalR
- **Hubs/** – SignalR hubs for real-time communication (`RoomHub.cs`)
- **Requests/** – request models for API
- **wwwroot/** – static files

### Frontend (Angular)
- **src/app/** – Angular application code (components, services, models)
- **src/assets/** – static assets (images, etc.)
- **src/environments/** – environment configs
- **README.md** – frontend documentation

## Key Technologies
- .NET 8.0 (Web API, SignalR)
- Angular 15+
- RxJS (frontend)
- JWT (authentication)
- CORS, SPA proxy

## Main Features
- Create and join rooms
- Online Cards Against Humanity gameplay
- Deck, card, and sentence management
- In-room chat
- Export/import cards and sentences
- Real-time multiplayer (SignalR)

## Model Structure (examples)
- **Room** – represents a game room, contains users, decks, cards, game state
- **Game** – game state, players, round, selected cards, etc.
- **Player** – player info, hand, score
- **DTOs** – simplified models for API/SignalR

## API Endpoints
- `/api/rooms` – list rooms
- `/api/room/{id}` – room details
- `/api/decks` – list decks
- `/api/user/{userId}` – user data
- `/api/login` – login

## SignalR (WebSocket)
- Hub: `/hub/room`
- Actions: join/leave room, start game, new round, confirm cards, choose winner, etc.

## How to Run
1. `dotnet run` – runs backend and frontend (Angular via proxy)
2. `cd ClientApp && npm install && ng serve` – run frontend only (dev mode)

## Testing
- Angular: `ng test` (unit), `ng e2e` (end-to-end)
- Backend: `dotnet test`

## To-do
- Private rooms
- Game history in chat
- Kicking and banning players
- Backend unit tests
- Check on endpoint if the user is owner of ther room or in the room
    - or remove roomId and get it from user?
- bug: after the first game => selecting the edit button => trying to remove a deck => error, no game object