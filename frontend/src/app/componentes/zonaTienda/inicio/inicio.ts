import { Component, signal, OnInit } from '@angular/core';
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
  imports: [TarjetasServicios],
  templateUrl: './inicio.html',
  styleUrl: './inicio.css',
})
export class Inicio implements OnInit {
  servicios = signal<Servicio[]>([]);
  categorias = signal<Categoria[]>([]);
  serviciosCategorias = signal<Servicio[]>([]);
  trabajosSolicitados = signal<Servicio[]>([]);
  cargandoTrabajosSolicitados = signal<boolean>(false);

  constructor(
    private serviciosService: ServiciosService,
    private categoriasService: CategoriasService,
    private authService: AuthService,
    private trabajosService: TrabajosService,
  ) {}

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
      },
      error: (err) => {
        console.error('Error cargando categorías:', err);
        // Fallback a datos locales si falla la API
        this.servicios.set(this.serviciosService.obtenerPrincipales());
      }
    });

    this.cargarTrabajosSolicitadosParaPrestador();
  }

  // Función auxiliar para obtener imagen según categoría
  private obtenerImagenCategoria(nombreCategoria: string): string {
    const imagenes: { [key: string]: string } = {
      'Automoción': '/imgs/mecanico.png',
      'Belleza': '/imgs/peluqueria.png',
      'Limpieza': '/imgs/limpieza.png',
      'Enseñanza': '/imgs/peluqueria.png',
      'Reparaciones': '/imgs/mecanico.png',
      'Cuidado Personal': '/imgs/limpieza.png',
      'Construcciones y Reformas': '/imgs/mecanico.png',
      'Otro': '/imgs/limpieza.png'
    };
    return imagenes[nombreCategoria] || '/imgs/limpieza.png';
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
}

