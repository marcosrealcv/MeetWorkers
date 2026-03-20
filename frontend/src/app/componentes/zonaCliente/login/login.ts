import { Component, OnInit } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { RegistroClientePayload } from '../../../models/cliente.interface';

type CategoriaJsonItem = {
  nombreCategoria: string;
  pathCategoria: string;
};

const API_CATEGORIAS_URL = 'http://localhost:3000/api/categorias';
const API_SUBCATEGORIAS_URL = 'http://localhost:3000/api/subcategorias';
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/;

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login implements OnInit {
  formulario!: FormGroup;
  categorias: string[] = [];
  ubicaciones = ['A domicilio', 'En mi lugar',  'Ambas opciones'];
  cargandoRegistro = false;
  errorRegistro = '';
  exitoRegistro = '';
  
  subcategorias: { [key: string]: string[] } = {};

  constructor(
    private readonly fb: FormBuilder,
    private readonly authService: AuthService,
    private readonly router: Router
  ) {}

  ngOnInit() {
    this.formulario = this.fb.group({
      nombre: ['', [Validators.required]],
      apellido: ['', [Validators.required]],
      telefono: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      contraseña: ['', [Validators.required, Validators.minLength(8), Validators.pattern(PASSWORD_REGEX)]],
      direccion: ['', [Validators.required]],
      descripcion: [''],
      es_prestador: [false],
      tipo_servicio: [''],
      categoria: [''],
      subcategoria: [''],
      descripcion_servicio: [''],
      ubicacion_servicio: [''],
      direccion_servicio: [''],
      coste_hora: ['']
    });

    this.formulario.get('categoria')?.valueChanges.subscribe(() => {
      this.formulario.get('subcategoria')?.setValue('');
    });

    this.formulario.get('es_prestador')?.valueChanges.subscribe((esPrestador: boolean) => {
      const camposServicio = ['tipo_servicio', 'categoria', 'subcategoria', 'descripcion_servicio', 'ubicacion_servicio', 'coste_hora'];

      for (const campo of camposServicio) {
        const control = this.formulario.get(campo);
        if (!control) {
          continue;
        }

        control.setValidators(esPrestador ? [Validators.required] : []);
        control.updateValueAndValidity({ emitEvent: false });
      }

      this.actualizarValidadorDireccionServicio();
    });

    this.formulario.get('ubicacion_servicio')?.valueChanges.subscribe(() => {
      this.actualizarValidadorDireccionServicio();
    });

    void this.cargarCategoriasDesdeBackend();
  }

  private actualizarValidadorDireccionServicio(): void {
    const controlDireccionServicio = this.formulario.get('direccion_servicio');
    if (!controlDireccionServicio) {
      return;
    }

    controlDireccionServicio.setValidators(this.necesitaDireccionServicio ? [Validators.required] : []);
    controlDireccionServicio.updateValueAndValidity({ emitEvent: false });
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

  onSubmit() {
    this.errorRegistro = '';
    this.exitoRegistro = '';

    if (!this.formulario.valid) {
      this.formulario.markAllAsTouched();
      return;
    }

    this.cargandoRegistro = true;

    const payload = this.formulario.value as RegistroClientePayload;

    this.authService.registrarCliente(payload).subscribe({
      next: () => {
        this.exitoRegistro = 'Registro completado. Ahora puedes iniciar sesión.';
        this.cargandoRegistro = false;
        this.formulario.reset({ es_prestador: false });
        setTimeout(() => {
          void this.router.navigate(['/iniciar-sesion']);
        }, 1200);
      },
      error: (error: HttpErrorResponse) => {
        this.cargandoRegistro = false;
        this.errorRegistro = error.error?.error ?? 'No se pudo completar el registro';
      }
    });
  }

  get esPrestador(): boolean {
    return this.formulario.get('es_prestador')?.value || false;
  }

  get categoriaSeleccionada(): string {
    return this.formulario.get('categoria')?.value || '';
  }

  get subcategoriasActuales(): string[] {
    const categoria = this.categoriaSeleccionada;
    return this.subcategorias[categoria] || [];
  }

  get ubicacionSeleccionada(): string {
    return this.formulario.get('ubicacion_servicio')?.value || '';
  }

  get necesitaDireccionServicio(): boolean {
    return this.esPrestador && (this.ubicacionSeleccionada === 'En mi lugar' || this.ubicacionSeleccionada === 'Ambas opciones');
  }
}
