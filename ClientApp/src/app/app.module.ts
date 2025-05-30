import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { HTTP_INTERCEPTORS, provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { AppComponent } from './app.component';
import { NavMenuComponent } from './components/nav-menu/nav-menu.component';
import { HomeComponent } from './components/home/home.component';
import { RoomsListComponent } from './components/rooms-list/rooms-list.component';
import { RoomComponent } from './components/room/room.component';
import { LoginComponent } from './components/login/login.component';
import { DecksComponent } from './components/decks/decks.component';

import { GameComponent } from './components/room/game/game.component';
import { GameBoardComponent } from './components/room/game/game-board/game-board.component';
import { GameButtonsComponent } from './components/room/game/game-buttons/game-buttons.component';
import { GameHandComponent } from './components/room/game/game-hand/game-hand.component';
import { GameConfigComponent } from './components/room/game-config/game-config.component';
import { GameConfigCardsComponent } from './components/room/game-config/game-config-cards/game-config-cards.component';
import { GameConfigSentencesComponent } from './components/room/game-config/game-config-sentences/game-config-sentences.component';
import { DecksBrowserComponent } from './components/room/game-config/decks-browser/decks-browser.component';
import { RoomFooterComponent } from './components/room/room-footer/room-footer.component';
import { RoomInfoComponent } from './components/room/room-footer/room-info/room-info.component';
import { PlayersListComponent } from './components/room/room-footer/players-list/players-list.component';
import { RoomLogComponent } from './components/room/room-footer/room-log/room-log.component';
import { LoadingIndicatorComponent } from './components/shared/loading-indicator/loading-indicator.component';

import { AppConfig } from './config/config';
import { UserService } from './services/user/user.service';
import { RoomService } from './services/room/room.service';
import { CurrentRoomService } from './services/current-room/current-room.service';
import { DeckService } from './services/deck/deck.service';
import { AuthInterceptor } from './helpers/auth-interceptor';

@NgModule({
  declarations: [
    AppComponent,
    NavMenuComponent,
    HomeComponent,
    RoomsListComponent,
    RoomComponent,
    RoomFooterComponent,
    LoginComponent,
    GameConfigComponent,
    GameConfigCardsComponent,
    GameConfigSentencesComponent,
    DecksBrowserComponent,
    RoomInfoComponent,
    PlayersListComponent,
    RoomLogComponent,
    GameComponent,
    GameBoardComponent,
    GameButtonsComponent,
    GameHandComponent,
    DecksComponent,
    LoadingIndicatorComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    FormsModule,
    RouterModule.forRoot([
      { path: '',           component: HomeComponent, pathMatch: 'full' },
      { path: 'rooms',      component: RoomsListComponent, pathMatch: 'full' },
      { path: 'login',      component: LoginComponent, pathMatch: 'full' },
      { path: 'decks',      component: DecksComponent, pathMatch: 'full' },
      { path: 'room/:guid', component: RoomComponent },
      { path: '**', component: HomeComponent }
    ])
  ],
  providers: [
    provideHttpClient(withInterceptorsFromDi()),
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
    AppConfig,
    UserService,
    RoomService,
    DeckService,
    CurrentRoomService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
