import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

type CategoriaJsonItem = {
  nombreCategoria: string;
  pathCategoria: string;
};

const API_CATEGORIAS_URL = 'http://localhost:3000/api/categorias';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login implements OnInit {
  formulario!: FormGroup;
  categorias: string[] = [];
  ubicaciones = ['A domicilio', 'En mi lugar',  'Ambas opciones'];
  
  subcategorias: { [key: string]: string[] } = {};

  constructor(private fb: FormBuilder) {}

  ngOnInit() {
    this.formulario = this.fb.group({
      nombre: ['', [Validators.required]],
      apellido: ['', [Validators.required]],
      telefono: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      contraseña: ['', [Validators.required, Validators.minLength(6)]],
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

  onSubmit() {
    if (this.formulario.valid) {
      console.log('Formulario enviado:', this.formulario.value);
      // Aquí irá la lógica para enviar los datos al backend
    } else {
      console.log('Formulario inválido');
    }
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
