import { Component, signal, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { TarjetasSubcategorias } from '../tarjetas-subcategorias/tarjetas-subcategorias';
import { Servicio } from '../../../models/servicio.interface';
import { ServiciosService } from '../../../services/servicios.service';
import { CategoriasService, Subcategoria } from '../../../services/categorias.service';

@Component({
  selector: 'app-pagina-servicios',
  imports: [TarjetasSubcategorias],
  templateUrl: './pagina-servicios.html',
  styleUrl: './pagina-servicios.css',
})
export class PaginaServicios implements OnInit {
  categoria = signal<string>('Todos los servicios');
  serviciosFiltrados = signal<Servicio[]>([]);
  subcategorias = signal<Subcategoria[]>([]);

  constructor(
    private route: ActivatedRoute,
    private serviciosService: ServiciosService,
    private categoriasService: CategoriasService
  ) {}

  ngOnInit() {
    this.route.queryParamMap.subscribe(params => {
      const pathCat = params.get('pathCategoria');
      if (pathCat) {
        // Obtener subcategorías dinámicamente
        this.categoriasService.obtenerSubcategorias(pathCat).subscribe({
          next: (subcategorias) => {
            this.subcategorias.set(subcategorias);
            
            // Convertir subcategorías a formato Servicio
            const servicios: Servicio[] = subcategorias.map((subcat, index) => ({
              id: index + 1,
              nombre: subcat.nombreCategoria,
              descripcion: `Servicios de ${subcat.nombreCategoria}`,
              precio: '',
              categoria: subcat.nombreCategoria,
              pathCategoria: subcat.pathCategoria,
              imagen: '/imgs/default.png',
              rating: 4.5
            }));
            this.serviciosFiltrados.set(servicios);
            
            // Obtener el nombre de la categoría
            if (servicios.length > 0) {
              this.categoria.set(servicios[0].categoria);
            }
          },
          error: (err) => {
            console.error('Error cargando subcategorías:', err);
            // Fallback a datos locales
            const filtrados = this.serviciosService.filtrarPorPathCategoria(pathCat);
            this.serviciosFiltrados.set(filtrados);
            if (filtrados.length > 0) {
              this.categoria.set(filtrados[0].nombre);
            }
          }
        });
      } else {
        // Si no hay filtro, mostrar todos los servicios
        this.serviciosFiltrados.set(this.serviciosService.obtenerTodos());
      }
    });
  }
}

