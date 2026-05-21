import { Component, OnDestroy, OnInit, HostListener } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../services/auth.service';
import { AvisosService } from '../../../services/avisos.service';
import { filter, Subscription } from 'rxjs';

@Component({
  selector: 'app-header',
  imports: [RouterLink, CommonModule],
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class Header implements OnInit, OnDestroy {
  cantidadAvisosNoLeidos = 0;
  dropdownOpen = false;
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
        this.dropdownOpen = false;
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

  toggleDropdown(): void {
    this.dropdownOpen = !this.dropdownOpen;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    const dropdown = target.closest('.profile-dropdown');
    if (!dropdown) {
      this.dropdownOpen = false;
    }
  }

  cerrarSesion(): void {
    this.authService.cerrarSesion();
    this.cantidadAvisosNoLeidos = 0;
    this.dropdownOpen = false;
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
        // deduplicate by _id in case backend returns duplicates
        const unique = new Map<string, any>();
        for (const a of avisos) {
          unique.set(String(a._id), a);
        }
        const deduped = Array.from(unique.values());
        this.cantidadAvisosNoLeidos = deduped.filter((aviso) => !aviso.leido).length;
      },
      error: () => {
        this.cantidadAvisosNoLeidos = 0;
      }
    });
  }

  irAAvisosPrestador(): void {
    void this.router.navigate(['/cuenta']);
    this.dropdownOpen = false;
  }

}
