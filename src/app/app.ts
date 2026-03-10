import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from "./components/header/header";
import { FooterComponent } from "./components/footer/footer";

@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  imports: [RouterOutlet, HeaderComponent, FooterComponent],
  styleUrls: ['./app.scss']
})
export class App {

    protected readonly title = signal('shop-frontend');
}
