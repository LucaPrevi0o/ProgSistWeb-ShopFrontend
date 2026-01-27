import { Component, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  imports: [RouterLink],
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('shop-frontend');
}
