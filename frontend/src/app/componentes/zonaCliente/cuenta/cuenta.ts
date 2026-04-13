import { Component, OnInit, inject } from '@angular/core';
import { DatePipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { Cliente } from '../../../models/cliente.interface';
import { AvisoPrestador } from '../../../models/aviso.interface';
import { AvisosService } from '../../../services/avisos.service';
import { TrabajosService } from '../../../services/trabajos.service';
import { TrabajoSolicitud } from '../../../models/trabajo-solicitud.interface';

type CategoriaJsonItem = {
  nombreCategoria: string;
  pathCategoria: string;
};

const API_CATEGORIAS_URL = 'http://localhost:3000/api/categorias';
const API_SUBCATEGORIAS_URL = 'http://localhost:3000/api/subcategorias';

@Component({
  selector: 'app-cuenta',
  imports: [ReactiveFormsModule, DatePipe],
  templateUrl: './cuenta.html',
  styleUrl: './cuenta.css',
})
export class Cuenta implements OnInit {
  private readonly fb = inject(FormBuilder);

  cliente: Cliente | null = null;
  cargandoPerfil = true;
  errorPerfil = '';
  mensajeExito = '';
  enModoEdicion = false;
  categorias: string[] = [];
  ubicaciones = ['A domicilio', 'En mi lugar', 'Ambas opciones'];
  subcategorias: { [key: string]: string[] } = {};
  avisosPrestador: AvisoPrestador[] = [];
  cargandoAvisos = false;
  errorAvisos = '';
  idsAvisosProcesando = new Set<string>();
  trabajosPublicados: TrabajoSolicitud[] = [];
  cargandoTrabajosPublicados = false;
  errorTrabajosPublicados = '';

  formularioEdicion = this.fb.group({
    nombre: [''],
    apellido: [''],
    telefono: [''],
    email: ['', [Validators.required, Validators.email]],
    direccion: [''],
    descripcion: [''],
    es_prestador: [false],
    tipo_servicio: [''],
    categoria: [''],
    subcategoria: [''],
    descripcion_servicio: [''],
    ubicacion_servicio: [''],
    direccion_servicio: [''],
    coste_hora: [0],
  });

  constructor(
    private readonly authService: AuthService,
    private readonly router: Router,
    private readonly avisosService: AvisosService,
    private readonly trabajosService: TrabajosService,
  ) {}

  ngOnInit(): void {
    const clienteSesion = this.authService.clienteActual();

    if (clienteSesion) {
      this.inicializarDatosCuenta(clienteSesion);
    }

    this.authService.cargarPerfilCliente().subscribe({
      next: (cliente) => {
        this.inicializarDatosCuenta(cliente);
      },
      error: (error: HttpErrorResponse) => {
        if (error.status === 401) {
          this.authService.cerrarSesion();
          this.cliente = null;
          this.enModoEdicion = false;
          this.cargandoPerfil = false;
          this.errorPerfil = error.error?.error ?? 'Tu sesión ha expirado, vuelve a iniciar sesión';
          return;
        }

        if (clienteSesion) {
          this.inicializarDatosCuenta(clienteSesion);
          this.errorPerfil = '';
          return;
        }

        this.cargandoPerfil = false;
        this.errorPerfil = error.error?.error ?? 'No se pudo refrescar tu perfil en este momento';
        console.error('No se pudo refrescar el perfil remoto:', error);
      }
    });

    this.formularioEdicion.get('categoria')?.valueChanges.subscribe(() => {
      this.formularioEdicion.get('subcategoria')?.setValue('');
    });

    void this.cargarCategoriasDesdeBackend();
  }

  private async cargarCategoriasDesdeBackend(): Promise<void> {
    try {
      const response = await fetch(API_CATEGORIAS_URL);

      if (!response.ok) {
        throw new Error(`No se pudieron cargar las categorías desde backend: ${response.status}`);
      }

      const categoriasPrincipales = (await response.json()) as CategoriaJsonItem[];
      this.categorias = categoriasPrincipales.map((item) => item.nombreCategoria);
      this.subcategorias = await this.cargarSubcategoriasPorCategoria(categoriasPrincipales);
    } catch (error) {
      console.error('Error cargando categorías/subcategorías desde backend:', error);
    }
  }

  private async cargarSubcategoriasPorCategoria(
    categoriasPrincipales: CategoriaJsonItem[]
  ): Promise<{ [key: string]: string[] }> {
    const subcategoriasPorCategoria: { [key: string]: string[] } = {};

    await Promise.all(
      categoriasPrincipales.map(async (categoria) => {
        const responseSubcategorias = await fetch(
          `${API_SUBCATEGORIAS_URL}/${encodeURIComponent(categoria.pathCategoria)}`
        );

        if (!responseSubcategorias.ok) {
          throw new Error(`No se pudieron cargar las subcategorías de ${categoria.nombreCategoria}`);
        }

        const subcategoriasJson = (await responseSubcategorias.json()) as CategoriaJsonItem[];
        subcategoriasPorCategoria[categoria.nombreCategoria] = subcategoriasJson.map(
          (item) => item.nombreCategoria
        );
      })
    );

    return subcategoriasPorCategoria;
  }

  private inicializarDatosCuenta(cliente: Cliente): void {
    this.cliente = cliente;
    this.rellenarFormulario(cliente);
    this.cargandoPerfil = false;
    this.cargarAvisosSiEsPrestador(cliente);
    this.cargarMisTrabajosPublicados(cliente);
  }

  private rellenarFormulario(cliente: Cliente): void {
    this.formularioEdicion.patchValue({
      nombre: cliente.nombre,
      apellido: cliente.apellido,
      telefono: cliente.telefono,
      email: cliente.email,
      direccion: cliente.direccion,
      descripcion: cliente.descripcion ?? '',
      es_prestador: cliente.es_prestador,
      tipo_servicio: cliente.tipo_servicio ?? '',
      categoria: cliente.categoria ?? '',
      subcategoria: cliente.subcategoria ?? '',
      descripcion_servicio: cliente.descripcion_servicio ?? '',
      ubicacion_servicio: cliente.ubicacion_servicio ?? '',
      direccion_servicio: cliente.direccion_servicio ?? '',
      coste_hora: cliente.coste_hora ?? 0,
    }, { emitEvent: false });
  }

  activarEdicion(): void {
    this.errorPerfil = '';
    this.mensajeExito = '';
    this.enModoEdicion = true;
  }

  cancelarEdicion(): void {
    if (this.cliente) {
      this.rellenarFormulario(this.cliente);
    }

    this.errorPerfil = '';
    this.mensajeExito = '';
    this.enModoEdicion = false;
  }

  guardarCambios(): void {
    this.errorPerfil = '';
    this.mensajeExito = '';

    const snapshotClienteAnterior = this.cliente ? { ...this.cliente } : null;
    const payload = this.formularioEdicion.value as Partial<Cliente>;

    if (this.cliente) {
      this.cliente = {
        ...this.cliente,
        ...payload,
      };
    }

    this.enModoEdicion = false;

    this.authService.actualizarPerfilCliente(payload).subscribe({
      next: (cliente) => {
        this.cliente = cliente;
        this.rellenarFormulario(cliente);
        this.mensajeExito = 'Datos actualizados correctamente';
      },
      error: (error: HttpErrorResponse | Error) => {
        if (snapshotClienteAnterior) {
          this.cliente = snapshotClienteAnterior;
          this.rellenarFormulario(snapshotClienteAnterior);
        }

        this.enModoEdicion = true;
        const status = error instanceof HttpErrorResponse ? error.status : 0;
        const backendError = error instanceof HttpErrorResponse ? error.error?.error : undefined;
        const detalleEstado = status > 0 ? ` (HTTP ${status})` : '';

        if (status === 401) {
          this.authService.cerrarSesion();
          this.cliente = null;
          this.enModoEdicion = false;
          this.errorPerfil = backendError ?? 'Tu sesión ha expirado, vuelve a iniciar sesión';
          return;
        }

        this.errorPerfil = backendError ?? `No se pudieron guardar los datos, intenta de nuevo${detalleEstado}`;
      }
    });
  }

  irAIniciarSesion(): void {
    void this.router.navigate(['/iniciar-sesion']);
  }

  cargarAvisosSiEsPrestador(clienteBase?: Cliente): void {
    const cliente = clienteBase ?? this.cliente;

    if (!cliente?.es_prestador) {
      this.avisosPrestador = [];
      this.errorAvisos = '';
      this.cargandoAvisos = false;
      return;
    }

    this.cargandoAvisos = true;
    this.errorAvisos = '';

    this.avisosService.obtenerMisAvisos().subscribe({
      next: (avisos) => {
        this.avisosPrestador = avisos;
        this.cargandoAvisos = false;
      },
      error: (error: HttpErrorResponse) => {
        if (error.status === 401 || error.status === 403) {
          this.avisosPrestador = [];
          this.errorAvisos = '';
          this.cargandoAvisos = false;
          return;
        }

        this.errorAvisos = error.error?.error ?? 'No se pudieron cargar los avisos';
        this.cargandoAvisos = false;
      },
    });
  }

  marcarComoLeido(idAviso: string): void {
    if (!idAviso || this.idsAvisosProcesando.has(idAviso)) {
      return;
    }

    this.idsAvisosProcesando.add(idAviso);

    this.avisosService.marcarAvisoLeido(idAviso).subscribe({
      next: () => {
        this.avisosPrestador = this.avisosPrestador.map((aviso) =>
          aviso._id === idAviso ? { ...aviso, leido: true } : aviso
        );
        this.idsAvisosProcesando.delete(idAviso);
      },
      error: () => {
        this.idsAvisosProcesando.delete(idAviso);
      },
    });
  }

  eliminarAviso(idAviso: string): void {
    if (!idAviso || this.idsAvisosProcesando.has(idAviso)) {
      return;
    }

    const confirmado = window.confirm('¿Quieres quitar este aviso de tu lista? No se borrará el anuncio original.');
    if (!confirmado) {
      return;
    }

    const avisosAnteriores = [...this.avisosPrestador];
    this.avisosPrestador = this.avisosPrestador.filter((aviso) => aviso._id !== idAviso);
    this.idsAvisosProcesando.add(idAviso);

    this.avisosService.eliminarAviso(idAviso).subscribe({
      next: () => {
        this.idsAvisosProcesando.delete(idAviso);
      },
      error: (error: HttpErrorResponse) => {
        this.avisosPrestador = avisosAnteriores;
        this.idsAvisosProcesando.delete(idAviso);
        this.errorAvisos = error.error?.error ?? 'No se pudo eliminar el aviso';
      },
    });
  }

  estaProcesandoAviso(idAviso: string): boolean {
    return this.idsAvisosProcesando.has(idAviso);
  }

  get cantidadAvisosNoLeidos(): number {
    return this.avisosPrestador.filter((aviso) => !aviso.leido).length;
  }

  cargarMisTrabajosPublicados(clienteBase?: Cliente): void {
    const cliente = clienteBase ?? this.cliente;

    if (!cliente) {
      this.trabajosPublicados = [];
      this.errorTrabajosPublicados = '';
      this.cargandoTrabajosPublicados = false;
      return;
    }

    this.cargandoTrabajosPublicados = true;
    this.errorTrabajosPublicados = '';

    this.trabajosService.obtenerMisTrabajos().subscribe({
      next: (trabajos) => {
        this.trabajosPublicados = trabajos;
        this.cargandoTrabajosPublicados = false;
      },
      error: (error: HttpErrorResponse) => {
        this.errorTrabajosPublicados = error.error?.error ?? 'No se pudieron cargar tus trabajos publicados';
        this.cargandoTrabajosPublicados = false;
      },
    });
  }

  editarTrabajo(idTrabajo: string): void {
    const trabajo = this.trabajosPublicados.find((item) => item._id === idTrabajo);

    if (!trabajo) {
      return;
    }

    void this.router.navigate(['/publicar-trabajo'], { state: { trabajo } });
  }

  eliminarTrabajo(idTrabajo: string): void {
    if (!idTrabajo) {
      return;
    }

    const confirmado = window.confirm('¿Quieres eliminar este anuncio? Esta acción no se puede deshacer.');
    if (!confirmado) {
      return;
    }

    const trabajosAnteriores = [...this.trabajosPublicados];
    this.trabajosPublicados = this.trabajosPublicados.filter((trabajo) => trabajo._id !== idTrabajo);

    this.trabajosService.eliminarTrabajo(idTrabajo).subscribe({
      next: () => {
      },
      error: (error: HttpErrorResponse) => {
        this.trabajosPublicados = trabajosAnteriores;
        this.errorTrabajosPublicados = error.error?.error ?? 'No se pudo eliminar el trabajo';
      },
    });
  }

  get tituloBloqueTrabajos(): string {
    if (this.cliente?.es_prestador) {
      return 'Trabajos que has publicado';
    }

    return 'Mis trabajos publicados';
  }

  get categoriaSeleccionada(): string {
    return this.formularioEdicion.get('categoria')?.value || '';
  }

  get subcategoriasActuales(): string[] {
    const categoria = this.categoriaSeleccionada;
    return this.subcategorias[categoria] || [];
  }

}
