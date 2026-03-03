import { Component, inject, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Header } from './componentes/zonaTienda/header/header';
import { Footer } from './componentes/zonaTienda/footer/footer';
import { filter } from 'rxjs';
import { Router, NavigationEnd } from '@angular/router';  
@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Header, Footer],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  
  protected readonly mostrarHeaderFooter = signal(true);

  private readonly router = inject(Router);

  constructor() {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: NavigationEnd) => {
      this.mostrarHeaderFooter.set(event.urlAfterRedirects !== '/login');
    });
  }

}
