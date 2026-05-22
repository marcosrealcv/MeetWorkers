import { Component, signal, OnInit, OnDestroy, inject } from '@angular/core';
import { Router } from '@angular/router';
import { Servicio } from '../../../models/servicio.interface';
import { ServiciosService } from '../../../services/servicios.service';
import { CategoriasService, Categoria } from '../../../services/categorias.service';

@Component({
  selector: 'app-inicio',
  standalone: true,
  templateUrl: './inicio.html',
  styleUrl: './inicio.css',
})
export class Inicio implements OnInit, OnDestroy {
  servicios = signal<Servicio[]>([]);
  categorias = signal<Categoria[]>([]);
  serviciosCategorias = signal<Servicio[]>([]);
  carruselIndice = signal<number>(0);
  private carruselIntervalo: any;
  private router = inject(Router);
  private serviciosService = inject(ServiciosService);
  private categoriasService = inject(CategoriasService);

  constructor() {}

  ngOnInit() {
    // Cargar categorías principales dinámicamente
    this.categoriasService.obtenerCategorias().subscribe({
      next: (categorias) => {
        this.categorias.set(categorias);
        // Convertir categorías a formato de servicio para las tarjetas
        const serviciosDeCategorias: Servicio[] = categorias.map((cat, index) => ({
          id: index + 1,
          nombre: cat.nombreCategoria,
          descripcion: `Servicios de ${cat.nombreCategoria}`,
          precio: '',
          categoria: cat.nombreCategoria,
          pathCategoria: cat.pathCategoria,
          imagen: this.obtenerImagenCategoria(cat.nombreCategoria),
          rating: 4.5
        }));
        this.serviciosCategorias.set(serviciosDeCategorias);
        this.iniciarCarrusel();
      },
      error: (err) => {
        console.error('Error cargando categorías:', err);
        // Fallback a datos locales si falla la API
        this.servicios.set(this.serviciosService.obtenerPrincipales());
      }
    });

  }

  ngOnDestroy() {
    if (this.carruselIntervalo) {
      clearInterval(this.carruselIntervalo);
    }
  }

  // Función auxiliar para obtener imagen según categoría
  private obtenerImagenCategoria(nombreCategoria: string): string {
    const imagenes: { [key: string]: string } = {
      'Automoción': '/imgs/automocion/automocion.png',
      'Belleza': '/imgs/belleza/belleza.png',
      'Limpieza': '/imgs/limpieza/limpieza.png',
      'Enseñanza': '/imgs/enseñanza/enseñanza.png',
      'Reparaciones': '/imgs/reparaciones/reparaciones.png',
      'Cuidado Personal': '/imgs/cuidado_personal/cuidado.png',
      'Construcciones y Reformas': '/imgs/construcciones_y_reformas/consturccion.png',
      'Otro': '/imgs/otros/otros.png'
    };
    return imagenes[nombreCategoria] || '/imgs/otros/otros.png';
  }

  // Métodos para el carrusel
  private iniciarCarrusel(): void {
    if (this.serviciosCategorias().length > 0) {
      this.carruselIntervalo = setInterval(() => {
        this.siguienteDiapositivaCarrusel();
      }, 4000); // Cambiar cada 4 segundos
    }
  }

  siguienteDiapositivaCarrusel(): void {
    const total = this.serviciosCategorias().length;
    if (total > 0) {
      this.carruselIndice.set((this.carruselIndice() + 1) % total);
      this.reiniciarCarruselTemporizador();
    }
  }

  anteriorDiapositivaCarrusel(): void {
    const total = this.serviciosCategorias().length;
    if (total > 0) {
      this.carruselIndice.set((this.carruselIndice() - 1 + total) % total);
      this.reiniciarCarruselTemporizador();
    }
  }

  seleccionarDiapositivaCarrusel(indice: number): void {
    this.carruselIndice.set(indice);
    this.reiniciarCarruselTemporizador();
  }

  private reiniciarCarruselTemporizador(): void {
    if (this.carruselIntervalo) {
      clearInterval(this.carruselIntervalo);
    }
    this.iniciarCarrusel();
  }

  obtenerDiapositivaActual(): Servicio | null {
    const servicios = this.serviciosCategorias();
    if (servicios.length > 0) {
      return servicios[this.carruselIndice()] || null;
    }
    return null;
  }

  navegarACategoria(): void {
    const diapositivaActual = this.obtenerDiapositivaActual();
    if (diapositivaActual && diapositivaActual.pathCategoria) {
      this.router.navigate(['/pagina-servicios'], {
        queryParams: { pathCategoria: diapositivaActual.pathCategoria }
      });
    }
  }

  explorarServicios(): void {
    this.router.navigate(['/pagina-servicios']);
  }

  irAPublicarTrabajo(): void {
    this.router.navigate(['/publicar-trabajo']);
  }

  irAVerTrabajos(): void {
    this.router.navigate(['/trabajos-solicitados']);
  }
}


