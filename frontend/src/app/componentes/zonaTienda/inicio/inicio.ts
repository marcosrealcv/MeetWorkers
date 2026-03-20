import { Component, signal, OnInit } from '@angular/core';
import { TarjetasServicios } from '../tarjetas-servicios/tarjetas-servicios';
import { Servicio } from '../../../models/servicio.interface';
import { ServiciosService } from '../../../services/servicios.service';
import { CategoriasService, Categoria } from '../../../services/categorias.service';

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

  constructor(
    private serviciosService: ServiciosService,
    private categoriasService: CategoriasService
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
}

