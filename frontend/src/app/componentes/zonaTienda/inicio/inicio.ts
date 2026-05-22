import { Component, signal, OnInit, OnDestroy, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Router } from '@angular/router';
import { TarjetasServicios } from '../tarjetas-servicios/tarjetas-servicios';
import { Servicio } from '../../../models/servicio.interface';
import { ServiciosService } from '../../../services/servicios.service';
import { CategoriasService, Categoria } from '../../../services/categorias.service';
import { AuthService } from '../../../services/auth.service';
import { TrabajosService } from '../../../services/trabajos.service';
import { TrabajoSolicitud } from '../../../models/trabajo-solicitud.interface';

@Component({
  selector: 'app-inicio',
  standalone: true,
  imports: [TarjetasServicios, RouterLink],
  templateUrl: './inicio.html',
  styleUrl: './inicio.css',
})
export class Inicio implements OnInit, OnDestroy {
  servicios = signal<Servicio[]>([]);
  categorias = signal<Categoria[]>([]);
  serviciosCategorias = signal<Servicio[]>([]);
  trabajosSolicitados = signal<Servicio[]>([]);
  cargandoTrabajosSolicitados = signal<boolean>(false);
  carruselIndice = signal<number>(0);
  private carruselIntervalo: any;
  private router = inject(Router);
  private serviciosService = inject(ServiciosService);
  private categoriasService = inject(CategoriasService);
  private authService = inject(AuthService);
  private trabajosService = inject(TrabajosService);

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

    this.cargarTrabajosSolicitadosParaPrestador();
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
      'Otro': '/imgs/limpieza/limpieza.png'
    };
    return imagenes[nombreCategoria] || '/imgs/limpieza/limpieza.png';
  }

  get esPrestador(): boolean {
    return Boolean(this.authService.clienteActual()?.es_prestador);
  }

  private cargarTrabajosSolicitadosParaPrestador(): void {
    const cliente = this.authService.clienteActual();
    const categoriaPrestador = String(cliente?.categoria ?? '').trim();

    if (!cliente?.es_prestador || !categoriaPrestador) {
      this.trabajosSolicitados.set([]);
      return;
    }

    this.cargandoTrabajosSolicitados.set(true);

    this.trabajosService.obtenerTrabajosPublicados().subscribe({
      next: (trabajos) => {
        const trabajosFiltrados = trabajos.filter((trabajo) => this.coincideCategoriaPrincipal(trabajo, categoriaPrestador));

        const tarjetasTrabajo = trabajosFiltrados.slice(0, 8).map((trabajo, index) => ({
          id: 1000 + index,
          nombre: trabajo.titulo,
          descripcion: trabajo.descripcion,
          precio: `${trabajo.presupuesto ?? 0}€`,
          categoria: trabajo.categoria,
          pathCategoria: trabajo.path_categoria,
          imagen: trabajo.fotos[0] || this.obtenerImagenCategoria(trabajo.categoria),
          rating: 0,
          trabajoId: trabajo._id,
          detalleTrabajo: trabajo,
          estadoTrabajo: trabajo.estado,
          prestadorAceptadoNombre: trabajo.prestador_aceptado_nombre,
        }));

        this.trabajosSolicitados.set(tarjetasTrabajo);
        this.cargandoTrabajosSolicitados.set(false);
      },
      error: (error) => {
        console.error('Error cargando trabajos solicitados para el prestador:', error);
        this.trabajosSolicitados.set([]);
        this.cargandoTrabajosSolicitados.set(false);
      }
    });
  }

  private coincideCategoriaPrincipal(trabajo: TrabajoSolicitud, categoriaPrestador: string): boolean {
    const categoriaPrestadorNormalizada = categoriaPrestador.toLowerCase();
    const categoriaTrabajo = String(trabajo.categoria ?? '').trim().toLowerCase();
    const pathCategoriaTrabajo = String(trabajo.path_categoria ?? '').trim().toLowerCase();
    const prefijoCategoriaTrabajo = pathCategoriaTrabajo.split('-')[0];

    const categoriaPrestadorPath = categoriaPrestadorNormalizada.split('-')[0];

    return (
      categoriaTrabajo === categoriaPrestadorNormalizada ||
      pathCategoriaTrabajo === categoriaPrestadorNormalizada ||
      prefijoCategoriaTrabajo === categoriaPrestadorPath
    );
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
}


