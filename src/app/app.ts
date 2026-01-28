import { Component, signal } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { UserService } from './services/user-service';

@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  imports: [RouterLink, RouterOutlet],
  styleUrls: ['./app.scss']
})
export class App {

  constructor(private userService: UserService) {}

  protected readonly title = signal('shop-frontend');

  isLoggedIn() { return this.userService.isLoggedIn(); }

  logout() { this.userService.logout(); }
}
