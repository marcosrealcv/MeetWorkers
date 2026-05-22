import { Component, OnInit, inject, signal } from '@angular/core';
import { TarjetasServicios } from '../tarjetas-servicios/tarjetas-servicios';
import { Servicio } from '../../../models/servicio.interface';
import { TrabajosService } from '../../../services/trabajos.service';
import { AuthService } from '../../../services/auth.service';
import { TrabajoSolicitud } from '../../../models/trabajo-solicitud.interface';

@Component({
  selector: 'app-trabajos-solicitados',
  standalone: true,
  imports: [TarjetasServicios],
  templateUrl: './trabajos-solicitados.html',
  styleUrl: './trabajos-solicitados.css',
})
export class TrabajosSolicitadosComponent implements OnInit {
  trabajosSolicitados = signal<Servicio[]>([]);
  cargandoTrabajosSolicitados = signal<boolean>(false);
  errorTrabajosSolicitados = signal<string>('');

  private readonly trabajosService = inject(TrabajosService);
  private readonly authService = inject(AuthService);

  ngOnInit(): void {
    this.cargarTrabajosSolicitados();
  }

  private cargarTrabajosSolicitados(): void {
    const cliente = this.authService.clienteActual();
    const categoriaPrestador = String(cliente?.categoria ?? '').trim();

    this.cargandoTrabajosSolicitados.set(true);
    this.errorTrabajosSolicitados.set('');

    this.trabajosService.obtenerTrabajosPublicados().subscribe({
      next: (trabajos) => {
        const trabajosFiltrados = categoriaPrestador
          ? trabajos.filter((trabajo) => this.coincideCategoriaPrincipal(trabajo, categoriaPrestador))
          : trabajos;

        const tarjetasTrabajo = trabajosFiltrados.map((trabajo, index) => this.convertirATarjeta(trabajo, index));
        this.trabajosSolicitados.set(tarjetasTrabajo);
        this.cargandoTrabajosSolicitados.set(false);
      },
      error: (error) => {
        console.error('Error cargando trabajos solicitados:', error);
        this.errorTrabajosSolicitados.set('No se pudieron cargar los trabajos solicitados en este momento.');
        this.trabajosSolicitados.set([]);
        this.cargandoTrabajosSolicitados.set(false);
      },
    });
  }

  private convertirATarjeta(trabajo: TrabajoSolicitud, index: number): Servicio {
    return {
      id: 2000 + index,
      nombre: trabajo.titulo,
      descripcion: trabajo.descripcion,
      precio: `${trabajo.presupuesto ?? 0}€`,
      categoria: trabajo.categoria,
      pathCategoria: trabajo.path_categoria,
      imagen: trabajo.fotos[0] || '/imgs/limpieza/limpieza.png',
      rating: 0,
      trabajoId: trabajo._id,
      detalleTrabajo: trabajo,
      estadoTrabajo: trabajo.estado,
      prestadorAceptadoNombre: trabajo.prestador_aceptado_nombre,
    };
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