import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { RouterModule } from '@angular/router';

import { AppComponent } from './app.component';
import { NavMenuComponent } from './components/nav-menu/nav-menu.component';
import { HomeComponent } from './components/home/home.component';
import { RoomsListComponent } from './components/rooms-list/rooms-list.component';
import { RoomComponent } from './components/room/room.component';
import { LoginComponent } from './components/login/login.component';
import { AppConfig } from './config/config';

import { Room } from 'src/app/model/Room';
import { GameConfigComponent } from './components/room/game-config/game-config.component';
import { RoomInfoComponent } from './components/room/room-info/room-info.component';
import { PlayersListComponent } from './components/room/players-list/players-list.component';
import { RoomLogComponent } from './components/room/room-log/room-log.component';
import { UserService } from './services/user.service';
import { RoomService } from './services/room.service';
import { GameComponent } from './components/room/game/game.component';
import { GameBoardComponent } from './components/room/game/game-board/game-board.component';
import { GameButtonsComponent } from './components/room/game/game-buttons/game-buttons.component';
import { GameHandComponent } from './components/room/game/game-hand/game-hand.component';

@NgModule({
  declarations: [
    AppComponent,
    NavMenuComponent,
    HomeComponent,
    RoomsListComponent,
    RoomComponent,
    LoginComponent,
    GameConfigComponent,
    RoomInfoComponent,
    PlayersListComponent,
    RoomLogComponent,
    GameComponent,
    GameBoardComponent,
    GameButtonsComponent,
    GameHandComponent
  ],
  imports: [
    BrowserModule.withServerTransition({ appId: 'ng-cli-universal' }),
    HttpClientModule,
    FormsModule,
    RouterModule.forRoot([
      { path: '',           component: HomeComponent, pathMatch: 'full' },
      { path: 'rooms',      component: RoomsListComponent, pathMatch: 'full' },
      { path: 'login',      component: LoginComponent, pathMatch: 'full' },
      { path: 'room/:guid', component: RoomComponent }
    ])
  ],
  providers: [
    AppConfig,
    UserService,
    RoomService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
