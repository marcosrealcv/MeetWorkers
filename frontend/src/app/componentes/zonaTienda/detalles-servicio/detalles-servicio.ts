import { Component, signal, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Servicio } from '../../../models/servicio.interface';
import { Proveedor } from '../../../models/proveedor.interface';
import { ServiciosService } from '../../../services/servicios.service';
import { ProveedoresService } from '../../../services/proveedores.service';
import { CategoriasService, Prestador } from '../../../services/categorias.service';
import { TarjetaProveedorComponent } from '../tarjeta-proveedor/tarjeta-proveedor';

@Component({
  selector: 'app-detalles-servicio',
  standalone: true,
  imports: [TarjetaProveedorComponent, CommonModule],
  templateUrl: './detalles-servicio.html',
  styleUrl: './detalles-servicio.css',
})
export class DetallesServicioComponent implements OnInit {
  servicio = signal<Servicio | null>(null);
  proveedores = signal<Proveedor[]>([]);
  prestadores = signal<Prestador[]>([]);
  pathCategoria = signal<string>('');

  constructor(
    private route: ActivatedRoute,
    private serviciosService: ServiciosService,
    private proveedoresService: ProveedoresService,
    private categoriasService: CategoriasService
  ) {}

  ngOnInit() {
    this.route.queryParamMap.subscribe(params => {
      const servicioId = params.get('id');
      const pathCat = params.get('pathCategoria');

      if (pathCat) {
        this.pathCategoria.set(pathCat);
        
        // Obtener prestadores de la BD para esta subcategoría
        this.categoriasService.obtenerPrestadoresPorSubcategoria(pathCat).subscribe({
          next: (prestadores) => {
            this.prestadores.set(prestadores);
            
            // Convertir prestadores a proveedores para usarlos en la tarjeta
            const proveedoresConvertidos: Proveedor[] = prestadores.map((prestador, index) => ({
              id: index + 1,
              nombre: `${prestador.nombre} ${prestador.apellido}`,
              especialidad: prestador.descripcion_servicio || 'Especialista',
              rating: 0,
              resenas: 0,
              precio: `${prestador.coste_hora}€/hora`,
              imagen: '/imgs/proveedor.png',
              experiencia: 'Prestador verificado'
            }));
            
            this.proveedores.set(proveedoresConvertidos);
          },
          error: (err) => {
            console.error('Error cargando prestadores:', err);
            // Fallback a datos locales si hay ID
            if (servicioId) {
              const proveedores = this.proveedoresService.obtenerProveedoresPorServicio(Number(servicioId));
              this.proveedores.set(proveedores);
            }
          }
        });
      } else if (servicioId) {
        // Fallback a datos locales si no hay pathCategoria
        const servicio = this.serviciosService.obtenerPorId(Number(servicioId));
        this.servicio.set(servicio || null);
        
        const proveedores = this.proveedoresService.obtenerProveedoresPorServicio(Number(servicioId));
        this.proveedores.set(proveedores);
      }
    });
  }
}

