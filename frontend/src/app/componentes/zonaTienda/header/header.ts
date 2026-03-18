import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-header',
  imports: [RouterLink],
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class Header {
  constructor(
    public readonly authService: AuthService,
    private readonly router: Router
  ) {}

  cerrarSesion(): void {
    this.authService.cerrarSesion();
    void this.router.navigate(['/']);
  }

}
