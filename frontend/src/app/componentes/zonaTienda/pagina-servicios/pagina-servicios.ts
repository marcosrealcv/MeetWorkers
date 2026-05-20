import { Component, signal, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { TarjetasSubcategorias } from '../tarjetas-subcategorias/tarjetas-subcategorias';
import { Servicio } from '../../../models/servicio.interface';
import { ServiciosService } from '../../../services/servicios.service';
import { CategoriasService, Categoria, Subcategoria } from '../../../services/categorias.service';

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
        this.categoria.set(this.formatearCategoriaDesdePath(pathCat));

        this.categoriasService.obtenerCategorias().subscribe({
          next: (categorias) => {
            const categoriaPrincipal = categorias.find((categoria) => categoria.pathCategoria === pathCat);

            if (categoriaPrincipal) {
              this.categoria.set(categoriaPrincipal.nombreCategoria);
            }
          },
          error: (err) => {
            console.error('Error cargando categoría principal:', err);
          }
        });

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
          },
          error: (err) => {
            console.error('Error cargando subcategorías:', err);
            // Fallback a datos locales
            const filtrados = this.serviciosService.filtrarPorPathCategoria(pathCat);
            this.serviciosFiltrados.set(filtrados);
          }
        });
      } else {
        // Si no hay filtro, mostrar todos los servicios
        this.serviciosFiltrados.set(this.serviciosService.obtenerTodos());
      }
    });
  }

  private formatearCategoriaDesdePath(pathCategoria: string): string {
    const textoNormalizado = pathCategoria.replace(/-/g, ' ').trim();

    if (!textoNormalizado) {
      return 'Todos los servicios';
    }

    return textoNormalizado.charAt(0).toUpperCase() + textoNormalizado.slice(1);
  }
}

