import { Component, signal, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Servicio } from '../../../models/servicio.interface';
import { Proveedor } from '../../../models/proveedor.interface';
import { ServiciosService } from '../../../services/servicios.service';
import { ProveedoresService } from '../../../services/proveedores.service';
import { CategoriasService, Prestador } from '../../../services/categorias.service';
import { TarjetaProveedorComponent } from '../tarjeta-proveedor/tarjeta-proveedor';

@Component({
  selector: 'app-detalles-servicio',
  standalone: true,
  imports: [TarjetaProveedorComponent],
  templateUrl: './detalles-servicio.html',
  styleUrl: './detalles-servicio.css',
})
export class DetallesServicioComponent implements OnInit {
  servicio = signal<Servicio | null>(null);
  proveedores = signal<Proveedor[]>([]);
  prestadores = signal<Prestador[]>([]);
  pathCategoria = signal<string>('');
  pathCategoriaPrincipal = signal<string>('');
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private serviciosService = inject(ServiciosService);
  private proveedoresService = inject(ProveedoresService);
  private categoriasService = inject(CategoriasService);

  constructor() {}

  ngOnInit() {
    this.route.queryParamMap.subscribe(params => {
      const servicioId = params.get('id');
      const pathCat = params.get('pathCategoria');
      const pathCatPrincipal = params.get('pathCategoriaPrincipal');

      if (pathCat) {
        this.pathCategoria.set(pathCat);
        if (pathCatPrincipal) {
          this.pathCategoriaPrincipal.set(pathCatPrincipal);
        }
        
        // Obtener prestadores de la BD para esta subcategoría
        this.categoriasService.obtenerPrestadoresPorSubcategoria(pathCat).subscribe({
          next: (prestadores) => {
            this.prestadores.set(prestadores);
            
            // Convertir prestadores a proveedores para usarlos en la tarjeta
            // Usando el _id real del prestador en BD
            const proveedoresConvertidos: Proveedor[] = prestadores.map((prestador: any) => ({
              id: prestador._id, // Usar el ID real de la BD
              nombre: `${prestador.nombre} ${prestador.apellido || ''}`,
              especialidad: prestador.descripcion_servicio || prestador.subcategoria || 'Especialista',
              rating: 0,
              resenas: 0,
              precio: `${prestador.coste_hora}€/hora`,
              imagen: prestador.foto_perfil || '/imgs/proveedor.svg',
              experiencia: 'Prestador verificado'
            }));
            
            this.proveedores.set(proveedoresConvertidos);
          },
          error: (err) => {
            console.error('Error cargando prestadores:', err);
            // Cargar todos los prestadores si falla la búsqueda por categoría
            this.proveedoresService.obtenerPrestadores().subscribe({
              next: (prestadoresReales) => {
                const proveedoresConvertidos: Proveedor[] = prestadoresReales.map((prestador) => ({
                  id: prestador._id,
                  nombre: `${prestador.nombre} ${prestador.apellido || ''}`,
                  especialidad: prestador.descripcion_servicio || prestador.subcategoria || 'Especialista',
                  rating: 0,
                  resenas: 0,
                  precio: `${prestador.coste_hora}€/hora`,
                  imagen: prestador.foto_perfil || '/imgs/proveedor.svg',
                  experiencia: 'Prestador verificado'
                }));
                this.proveedores.set(proveedoresConvertidos);
              }
            });
          }
        });
      } else if (servicioId) {
        // Fallback: cargar todos los prestadores reales
        const servicio = this.serviciosService.obtenerPorId(Number(servicioId));
        this.servicio.set(servicio || null);
        
        this.proveedoresService.obtenerPrestadores().subscribe({
          next: (prestadoresReales) => {
            const proveedoresConvertidos: Proveedor[] = prestadoresReales.map((prestador) => ({
              id: prestador._id,
              nombre: `${prestador.nombre} ${prestador.apellido || ''}`,
              especialidad: prestador.descripcion_servicio || prestador.subcategoria || 'Especialista',
              rating: 0,
              resenas: 0,
              precio: `${prestador.coste_hora}€/hora`,
              imagen: prestador.foto_perfil || '/imgs/proveedor.svg',
              experiencia: 'Prestador verificado'
            }));
            this.proveedores.set(proveedoresConvertidos);
          },
          error: (err) => {
            console.error('Error cargando prestadores:', err);
          }
        });
      }
    });
  }

  volverASubcategorias(): void {
    if (this.pathCategoriaPrincipal()) {
      this.router.navigate(['/pagina-servicios'], {
        queryParams: { pathCategoria: this.pathCategoriaPrincipal() }
      });
    } else if (this.pathCategoria()) {
      this.router.navigate(['/pagina-servicios'], {
        queryParams: { pathCategoria: this.pathCategoria() }
      });
    } else {
      this.router.navigate(['/pagina-servicios']);
    }
  }
}

