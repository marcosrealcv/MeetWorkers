import { Component, OnInit } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { CategoriasService, Categoria, Subcategoria } from '../../../services/categorias.service';
import { TrabajosService } from '../../../services/trabajos.service';
import { NuevoTrabajoSolicitudPayload, TrabajoSolicitud } from '../../../models/trabajo-solicitud.interface';

const MAX_FOTOS = 15;
const MAX_DIMENSION_IMAGEN = 1200;
const CALIDAD_IMAGEN = 0.6;
const TAMANO_MAXIMO_DOC_ESTIMADO = 10 * 1024 * 1024;

@Component({
  selector: 'app-publicar-trabajo',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './publicar-trabajo.html',
  styleUrls: ['./publicar-trabajo.css'],
})
export class PublicarTrabajoComponent implements OnInit {
  formulario!: FormGroup;
  categorias: Categoria[] = [];
  subcategorias: Subcategoria[] = [];
  fotosSeleccionadas: string[] = [];
  nombresFotosSeleccionadas: string[] = [];
  cargando = false;
  error = '';
  exito = '';
  resumenErroresFormulario = '';
  arrastrandoArchivos = false;
  trabajoIdEdicion = '';

  constructor(
    private readonly fb: FormBuilder,
    private readonly authService: AuthService,
    private readonly categoriasService: CategoriasService,
    private readonly trabajosService: TrabajosService,
    private readonly router: Router,
    private readonly route: ActivatedRoute,
  ) {}

  ngOnInit(): void {
    const clienteActual = this.authService.clienteActual();

    this.formulario = this.fb.group({
      cliente_nombre: [clienteActual?.nombre ?? '', [Validators.required]],
      cliente_email: [clienteActual?.email ?? '', [Validators.required, Validators.email]],
      cliente_telefono: [clienteActual?.telefono ?? '', [Validators.required]],
      titulo: ['', [Validators.required, Validators.minLength(8)]],
      descripcion: ['', [Validators.required, Validators.minLength(25)]],
      categoria: ['', [Validators.required]],
      subcategoria: ['', [Validators.required]],
      ubicacion: ['', [Validators.required]],
      presupuesto: [''],
      fecha_limite: [''],
      cliente_id: [clienteActual?._id ?? ''],
    });

    this.formulario.get('categoria')?.valueChanges.subscribe((pathCategoria: string) => {
      this.formulario.get('subcategoria')?.setValue('');

      if (pathCategoria) {
        void this.cargarSubcategorias(pathCategoria);
        return;
      }

      this.subcategorias = [];
    });

    void this.cargarCategorias();

    const trabajoDesdeNavegacion = (history.state?.trabajo as TrabajoSolicitud | undefined) ?? undefined;

    if (trabajoDesdeNavegacion?._id) {
      this.trabajoIdEdicion = trabajoDesdeNavegacion._id;
      this.rellenarFormularioDesdeTrabajo(trabajoDesdeNavegacion);
    } else {
      this.route.queryParamMap.subscribe((params) => {
        const idTrabajo = String(params.get('id') ?? '').trim();

        if (!idTrabajo) {
          this.trabajoIdEdicion = '';
          return;
        }

        this.trabajoIdEdicion = idTrabajo;
        void this.cargarTrabajoParaEdicion(idTrabajo);
      });
    }
  }

  async onArchivosSeleccionados(evento: Event): Promise<void> {
    const input = evento.target as HTMLInputElement;
    const archivos = Array.from(input.files ?? []);

    await this.agregarArchivos(archivos);
    input.value = '';
  }

  onDragOver(evento: DragEvent): void {
    evento.preventDefault();
    this.arrastrandoArchivos = true;
  }

  onDragLeave(evento: DragEvent): void {
    evento.preventDefault();
    this.arrastrandoArchivos = false;
  }

  async onDrop(evento: DragEvent): Promise<void> {
    evento.preventDefault();
    this.arrastrandoArchivos = false;

    const archivos = Array.from(evento.dataTransfer?.files ?? []);
    await this.agregarArchivos(archivos);
  }

  quitarFoto(indice: number): void {
    this.fotosSeleccionadas = this.fotosSeleccionadas.filter((_, posicion) => posicion !== indice);
    this.nombresFotosSeleccionadas = this.nombresFotosSeleccionadas.filter((_, posicion) => posicion !== indice);
  }

  onSubmit(): void {
    this.error = '';
    this.exito = '';
    this.resumenErroresFormulario = '';

    if (this.formulario.invalid) {
      this.formulario.markAllAsTouched();
      this.resumenErroresFormulario = this.construirResumenErrores();
      return;
    }

    const categoriaSeleccionada = this.categorias.find((categoria) => categoria.pathCategoria === this.categoriaSeleccionada);
    const subcategoriaSeleccionada = this.subcategorias.find((subcategoria) => subcategoria.pathCategoria === this.subcategoriaSeleccionada);
    const presupuestoValor = Number(this.formulario.get('presupuesto')?.value ?? 0);

    const payload: NuevoTrabajoSolicitudPayload = {
      cliente_id: String(this.formulario.get('cliente_id')?.value ?? '').trim(),
      cliente_nombre: String(this.formulario.get('cliente_nombre')?.value ?? '').trim(),
      cliente_email: String(this.formulario.get('cliente_email')?.value ?? '').trim().toLowerCase(),
      cliente_telefono: String(this.formulario.get('cliente_telefono')?.value ?? '').trim(),
      titulo: String(this.formulario.get('titulo')?.value ?? '').trim(),
      descripcion: String(this.formulario.get('descripcion')?.value ?? '').trim(),
      categoria: categoriaSeleccionada?.nombreCategoria ?? this.categoriaSeleccionada,
      path_categoria: this.categoriaSeleccionada,
      subcategoria: subcategoriaSeleccionada?.nombreCategoria ?? this.subcategoriaSeleccionada,
      path_subcategoria: this.subcategoriaSeleccionada,
      ubicacion: String(this.formulario.get('ubicacion')?.value ?? '').trim(),
      presupuesto: Number.isFinite(presupuestoValor) ? presupuestoValor : 0,
      fecha_limite: String(this.formulario.get('fecha_limite')?.value ?? '').trim(),
      fotos: [...this.fotosSeleccionadas],
    };

    this.cargando = true;

    const peticion = this.trabajoIdEdicion
      ? this.trabajosService.actualizarTrabajo(this.trabajoIdEdicion, payload)
      : this.trabajosService.publicarTrabajo(payload);

    peticion.subscribe({
      next: () => {
        const clienteActual = this.authService.clienteActual();
        const estabaEditando = Boolean(this.trabajoIdEdicion);

        this.cargando = false;
        this.exito = estabaEditando ? 'Tu trabajo se ha actualizado correctamente.' : 'Tu trabajo se ha publicado correctamente.';
        this.formulario.reset({
          cliente_nombre: clienteActual?.nombre ?? '',
          cliente_email: clienteActual?.email ?? '',
          cliente_telefono: clienteActual?.telefono ?? '',
          cliente_id: clienteActual?._id ?? '',
        });
        this.fotosSeleccionadas = [];
        this.nombresFotosSeleccionadas = [];
        this.subcategorias = [];
        this.resumenErroresFormulario = '';

        if (estabaEditando) {
          this.trabajoIdEdicion = '';
          void this.router.navigate(['/publicar-trabajo'], { replaceUrl: true });
        }
      },
      error: (error: HttpErrorResponse) => {
        this.cargando = false;

        if (error.status === 0) {
          this.error = 'No hay conexión con el backend. Verifica que el servidor esté iniciado en el puerto 3000.';
          return;
        }

        if (error.status === 413) {
          this.error = error.error?.error ?? 'Las fotos superan el tamaño permitido. Reduce cantidad o peso de imágenes.';
          return;
        }

        this.error = error.error?.error ?? `No se pudo publicar el trabajo (HTTP ${error.status})`;
      },
    });
  }

  get categoriaSeleccionada(): string {
    return String(this.formulario.get('categoria')?.value ?? '');
  }

  get subcategoriaSeleccionada(): string {
    return String(this.formulario.get('subcategoria')?.value ?? '');
  }

  get puedeEnviar(): boolean {
    return !this.cargando;
  }

  get tituloFormulario(): string {
    return this.trabajoIdEdicion ? 'Editar trabajo publicado' : 'Publica el trabajo que necesitas';
  }

  get textoBotonSubmit(): string {
    return this.trabajoIdEdicion ? 'Actualizar trabajo' : 'Publicar trabajo';
  }

  tieneError(controlName: string): boolean {
    const control = this.formulario.get(controlName);
    return Boolean(control && control.invalid && control.touched);
  }

  mensajeError(controlName: string): string {
    const control = this.formulario.get(controlName);

    if (!control || !control.errors || !control.touched) {
      return '';
    }

    if (control.errors['required']) {
      return 'Este campo es obligatorio';
    }

    if (control.errors['email']) {
      return 'Introduce un correo electrónico válido';
    }

    if (control.errors['minlength']) {
      const minLength = Number(control.errors['minlength']['requiredLength'] ?? 0);
      return `Debes escribir al menos ${minLength} caracteres`;
    }

    return 'Revisa este campo';
  }

  private async cargarCategorias(): Promise<void> {
    this.categoriasService.obtenerCategorias().subscribe({
      next: (categorias) => {
        this.categorias = categorias;
      },
      error: (error) => {
        console.error('Error cargando categorias para publicar trabajo:', error);
      },
    });
  }

  private async cargarTrabajoParaEdicion(idTrabajo: string): Promise<void> {
    this.error = '';
    this.exito = '';

    this.trabajosService.obtenerTrabajoPorId(idTrabajo).subscribe({
      next: (trabajo) => {
        this.rellenarFormularioDesdeTrabajo(trabajo);
      },
      error: (error: HttpErrorResponse) => {
        if (error.status === 401) {
          this.error = 'Debes iniciar sesión para editar un trabajo';
          return;
        }

        this.error = error.error?.error ?? 'No se pudo cargar el trabajo para editar';
      },
    });
  }

  private rellenarFormularioDesdeTrabajo(trabajo: TrabajoSolicitud): void {
    this.formulario.patchValue({
      cliente_nombre: trabajo.cliente_nombre,
      cliente_email: trabajo.cliente_email,
      cliente_telefono: trabajo.cliente_telefono,
      titulo: trabajo.titulo,
      descripcion: trabajo.descripcion,
      categoria: trabajo.path_categoria,
      subcategoria: trabajo.path_subcategoria,
      ubicacion: trabajo.ubicacion,
      presupuesto: trabajo.presupuesto ?? 0,
      fecha_limite: trabajo.fecha_limite ?? '',
      cliente_id: trabajo.cliente_id ?? this.authService.clienteActual()?._id ?? '',
    }, { emitEvent: false });

    this.categoriaSeleccionada && this.cargarSubcategorias(this.categoriaSeleccionada, trabajo.path_subcategoria);

    this.fotosSeleccionadas = [...(trabajo.fotos ?? [])];
    this.nombresFotosSeleccionadas = this.fotosSeleccionadas.map((_, indice) => `Imagen ${indice + 1}`);
  }

  private cargarSubcategorias(pathCategoria: string, subcategoriaSeleccionada?: string): void {
    this.categoriasService.obtenerSubcategorias(pathCategoria).subscribe({
      next: (subcategorias) => {
        this.subcategorias = subcategorias;
        if (subcategoriaSeleccionada) {
          this.formulario.get('subcategoria')?.setValue(subcategoriaSeleccionada, { emitEvent: false });
        }
      },
      error: (error) => {
        console.error('Error cargando subcategorias para publicar trabajo:', error);
        this.subcategorias = [];
      },
    });
  }

  private async agregarArchivos(archivos: File[]): Promise<void> {
    if (archivos.length === 0) {
      return;
    }

    if (this.fotosSeleccionadas.length >= MAX_FOTOS) {
      this.error = `Solo puedes subir un máximo de ${MAX_FOTOS} fotos`;
      return;
    }

    const archivosValidos = archivos.filter((archivo) => archivo.type.startsWith('image/'));

    if (archivosValidos.length === 0) {
      this.error = 'Solo se permiten archivos de imagen';
      return;
    }

    const huecosDisponibles = MAX_FOTOS - this.fotosSeleccionadas.length;
    const archivosFinales = archivosValidos.slice(0, huecosDisponibles);

    if (archivosValidos.length > archivosFinales.length) {
      this.error = `Solo puedes subir un máximo de ${MAX_FOTOS} fotos. Se han añadido ${archivosFinales.length} imagen(es).`;
    }

    const resultados = await Promise.all(
      archivosFinales.map(async (archivo) => {
        try {
          const dataUrl = await this.leerArchivoComoDataUrl(archivo);
          const dataUrlComprimida = await this.comprimirImagenDataUrl(dataUrl);
          return { ok: true as const, dataUrl: dataUrlComprimida, nombre: archivo.name };
        } catch {
          return { ok: false as const, nombre: archivo.name };
        }
      })
    );

    const fotosLeidas: string[] = [];
    const nombresLeidos: string[] = [];

    for (const resultado of resultados) {
      if (resultado.ok) {
        fotosLeidas.push(resultado.dataUrl);
        nombresLeidos.push(resultado.nombre);
      } else {
        this.error = 'No se pudo leer alguna imagen seleccionada';
      }
    }

    const fotosTotales = [...this.fotosSeleccionadas, ...fotosLeidas];
    const tamanoEstimado = fotosTotales.reduce((acumulado, foto) => acumulado + this.estimarTamanoBase64(foto), 0);

    if (tamanoEstimado > TAMANO_MAXIMO_DOC_ESTIMADO) {
      this.error = 'Las imágenes ocupan demasiado. Reduce el tamaño o sube menos fotos para que Mongo pueda guardarlas.';
      return;
    }

    this.fotosSeleccionadas = [...this.fotosSeleccionadas, ...fotosLeidas];
    this.nombresFotosSeleccionadas = [...this.nombresFotosSeleccionadas, ...nombresLeidos];

    if (archivosValidos.length <= archivosFinales.length) {
      this.error = '';
    }
  }

  private construirResumenErrores(): string {
    const camposConEtiqueta: Array<{ key: string; label: string }> = [
      { key: 'cliente_nombre', label: 'Tu nombre' },
      { key: 'cliente_email', label: 'Tu correo' },
      { key: 'cliente_telefono', label: 'Tu teléfono' },
      { key: 'ubicacion', label: 'Ubicación del trabajo' },
      { key: 'categoria', label: 'Categoría' },
      { key: 'subcategoria', label: 'Subcategoría' },
      { key: 'titulo', label: 'Título del trabajo' },
      { key: 'descripcion', label: 'Descripción' },
    ];

    const faltan: string[] = [];

    for (const campo of camposConEtiqueta) {
      const control = this.formulario.get(campo.key);
      if (this.controlInvalido(control)) {
        faltan.push(campo.label);
      }
    }

    if (faltan.length === 0) {
      return 'Revisa los campos marcados en rojo';
    }

    return `Te falta completar o corregir: ${faltan.join(', ')}`;
  }

  private controlInvalido(control: AbstractControl | null): boolean {
    return Boolean(control && control.invalid);
  }

  private leerArchivoComoDataUrl(archivo: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const lector = new FileReader();

      lector.onload = () => {
        resolve(String(lector.result ?? ''));
      };

      lector.onerror = () => reject(new Error(`No se pudo leer el archivo ${archivo.name}`));
      lector.readAsDataURL(archivo);
    });
  }

  private comprimirImagenDataUrl(dataUrl: string): Promise<string> {
    return new Promise((resolve) => {
      const imagen = new Image();

      imagen.onload = () => {
        const canvas = document.createElement('canvas');

        let ancho = imagen.width;
        let alto = imagen.height;

        if (ancho > MAX_DIMENSION_IMAGEN || alto > MAX_DIMENSION_IMAGEN) {
          const ratio = Math.min(MAX_DIMENSION_IMAGEN / ancho, MAX_DIMENSION_IMAGEN / alto);
          ancho = Math.round(ancho * ratio);
          alto = Math.round(alto * ratio);
        }

        canvas.width = ancho;
        canvas.height = alto;

        const contexto = canvas.getContext('2d');

        if (!contexto) {
          resolve(dataUrl);
          return;
        }

        contexto.drawImage(imagen, 0, 0, ancho, alto);
        const comprimida = canvas.toDataURL('image/webp', CALIDAD_IMAGEN);
        resolve(comprimida || dataUrl);
      };

      imagen.onerror = () => resolve(dataUrl);
      imagen.src = dataUrl;
    });
  }

  private estimarTamanoBase64(dataUrl: string): number {
    const contenidoBase64 = dataUrl.includes(',') ? dataUrl.split(',')[1] : dataUrl;
    return Math.ceil((contenidoBase64.length * 3) / 4);
  }

  volverACrear(): void {
    this.trabajoIdEdicion = '';
    this.error = '';
    this.exito = '';
    this.fotosSeleccionadas = [];
    this.nombresFotosSeleccionadas = [];
    this.subcategorias = [];
    this.formulario.reset({
      cliente_nombre: this.authService.clienteActual()?.nombre ?? '',
      cliente_email: this.authService.clienteActual()?.email ?? '',
      cliente_telefono: this.authService.clienteActual()?.telefono ?? '',
      cliente_id: this.authService.clienteActual()?._id ?? '',
    });
    void this.router.navigate(['/publicar-trabajo']);
  }
}