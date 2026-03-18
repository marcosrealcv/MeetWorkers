import { Component, OnInit, inject } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { Cliente } from '../../../models/cliente.interface';

type CategoriaJsonItem = {
  nombreCategoria: string;
  pathCategoria: string;
};

const API_CATEGORIAS_URL = 'http://localhost:3000/api/categorias';

@Component({
  selector: 'app-cuenta',
  imports: [ReactiveFormsModule],
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
    private readonly router: Router
  ) {}

  ngOnInit(): void {
    const clienteSesion = this.authService.clienteActual();

    if (clienteSesion) {
      // Muestra datos de sesión al instante para evitar esperar al refresco remoto.
      this.cliente = clienteSesion;
      this.rellenarFormulario(clienteSesion);
      this.cargandoPerfil = false;
    }

    this.authService.cargarPerfilCliente().subscribe({
      next: (cliente) => {
        this.cliente = cliente;
        this.rellenarFormulario(cliente);
        this.cargandoPerfil = false;
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

        // Si falla la actualización remota, mantenemos los datos locales de sesión.
        this.errorPerfil = '';
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

      const categoriasJson = (await response.json()) as CategoriaJsonItem[];
      this.construirCategoriasDesdeJson(categoriasJson);
    } catch (error) {
      console.error('Error cargando categorías/subcategorías desde backend:', error);
    }
  }

  private construirCategoriasDesdeJson(categoriasJson: CategoriaJsonItem[]): void {
    const categoriasPrincipales = categoriasJson.filter((item) => !item.pathCategoria.includes('-'));

    this.categorias = categoriasPrincipales.map((item) => item.nombreCategoria);

    const subcategoriasPorCategoria: { [key: string]: string[] } = {};

    for (const categoria of categoriasPrincipales) {
      const prefijoSubcategoria = `${categoria.pathCategoria}-`;

      subcategoriasPorCategoria[categoria.nombreCategoria] = categoriasJson
        .filter((item) => item.pathCategoria.startsWith(prefijoSubcategoria))
        .map((item) => item.nombreCategoria);
    }

    this.subcategorias = subcategoriasPorCategoria;
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

  get categoriaSeleccionada(): string {
    return this.formularioEdicion.get('categoria')?.value || '';
  }

  get subcategoriasActuales(): string[] {
    const categoria = this.categoriaSeleccionada;
    return this.subcategorias[categoria] || [];
  }

}
