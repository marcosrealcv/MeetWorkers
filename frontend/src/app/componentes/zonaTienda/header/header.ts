import { Component, OnDestroy, OnInit } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { AvisosService } from '../../../services/avisos.service';
import { filter, Subscription } from 'rxjs';

@Component({
  selector: 'app-header',
  imports: [RouterLink],
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class Header implements OnInit, OnDestroy {
  cantidadAvisosNoLeidos = 0;
  private routerEventsSubscription: Subscription | null = null;
  private pollingAvisosId: ReturnType<typeof setInterval> | null = null;

  constructor(
    public readonly authService: AuthService,
    private readonly router: Router,
    private readonly avisosService: AvisosService,
  ) {}

  ngOnInit(): void {
    this.actualizarContadorAvisos();

    this.routerEventsSubscription = this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe(() => {
        this.actualizarContadorAvisos();
      });

    this.pollingAvisosId = setInterval(() => {
      this.actualizarContadorAvisos();
    }, 30000);
  }

  ngOnDestroy(): void {
    this.routerEventsSubscription?.unsubscribe();
    if (this.pollingAvisosId) {
      clearInterval(this.pollingAvisosId);
      this.pollingAvisosId = null;
    }
  }

  cerrarSesion(): void {
    this.authService.cerrarSesion();
    this.cantidadAvisosNoLeidos = 0;
    void this.router.navigate(['/']);
  }

  actualizarContadorAvisos(): void {
    const cliente = this.authService.clienteActual();

    if (!this.authService.estaAutenticado() || !cliente?.es_prestador) {
      this.cantidadAvisosNoLeidos = 0;
      return;
    }

    this.avisosService.obtenerMisAvisos().subscribe({
      next: (avisos) => {
        this.cantidadAvisosNoLeidos = avisos.filter((aviso) => !aviso.leido).length;
      },
      error: () => {
        this.cantidadAvisosNoLeidos = 0;
      }
    });
  }

  irAAvisosPrestador(): void {
    void this.router.navigate(['/cuenta']);
  }

}
