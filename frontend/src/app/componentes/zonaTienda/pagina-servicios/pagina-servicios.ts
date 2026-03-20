import { Component, signal, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { TarjetasSubcategorias } from '../tarjetas-subcategorias/tarjetas-subcategorias';
import { Servicio } from '../../../models/servicio.interface';
import { ServiciosService } from '../../../services/servicios.service';

@Component({
  selector: 'app-pagina-servicios',
  imports: [TarjetasSubcategorias],
  templateUrl: './pagina-servicios.html',
  styleUrl: './pagina-servicios.css',
})
export class PaginaServicios implements OnInit {
  categoria = signal<string>('Todos los servicios');
  serviciosFiltrados = signal<Servicio[]>([]);

  constructor(
    private route: ActivatedRoute,
    private serviciosService: ServiciosService
  ) {}

  ngOnInit() {
    this.route.queryParamMap.subscribe(params => {
      const pathCat = params.get('pathCategoria');
      if (pathCat) {
        const filtrados = this.serviciosService.filtrarPorPathCategoria(pathCat);
        this.serviciosFiltrados.set(filtrados);
        
        // Obtener el nombre de la categoría del primer servicio encontrado
        if (filtrados.length > 0) {
          this.categoria.set(filtrados[0].nombre);
        }
      } else {
        this.serviciosFiltrados.set(this.serviciosService.obtenerTodos());
      }
    });
  }
}
