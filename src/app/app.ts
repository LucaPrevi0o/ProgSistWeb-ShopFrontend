import { Component, signal } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  imports: [RouterLink, RouterOutlet],
  styleUrls: ['./app.scss']
})
export class App {
  protected readonly title = signal('shop-frontend');
}
