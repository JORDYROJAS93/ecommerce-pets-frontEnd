import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { navbarComponent } from './shared/navbar/navbar';
import { FooterComponent } from './shared/footer/footer';
import { headerComponent } from './shared/header/header';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet,navbarComponent,FooterComponent,headerComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  protected title = 'ecommerce-pets';
}
