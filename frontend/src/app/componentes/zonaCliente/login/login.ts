import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login implements OnInit {
  formulario!: FormGroup;
  categorias = ['Automoción', 'Belleza', 'Enseñanza', 'Reparaciones', 'Limpieza', 'Cuidado Personal', 'Construcciones y Reformas', 'Otro'];
  ubicaciones = ['A domicilio', 'En mi lugar',  'Ambas opciones'];
  
  subcategorias: { [key: string]: string[] } = {
    'Automoción': ['Mecánico', 'Electricista del automóvil', 'Chapista', 'Tapicería', 'Neumáticos'],
    'Belleza': ['Peluquería', 'Manicura', 'Pedicura', 'Depilación', 'Masaje facial', 'Estética corporal'],
    'Enseñanza': ['Inglés', 'Matemáticas', 'Español', 'Informática', 'Música', 'Deporte', 'Apoyo escolar'],
    'Reparaciones': ['Carpintería', 'Albañilería', 'Fontanería', 'Electricidad', 'Herrería', 'Vidriería'],
    'Limpieza': ['Limpieza del hogar', 'Limpieza de oficinas', 'Limpieza de ventanas', 'Presupuesto especial'],
    'Cuidado Personal': ['Cuidado de niños', 'Cuidado de ancianos', 'Cuidado de mascotas'],
    'Construcciones y Reformas': ['Remodelación de baños', 'Remodelación de cocinas', 'Diseño de interiores', 'Muebles a medida', 'Armarios empotrados', 'Estanterías personalizadas', 'Reformas integrales'],
    'Otro': ['Especifica en la descripción']
  };

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
