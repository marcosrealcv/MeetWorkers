import { Component, Input, inject } from '@angular/core';
import { Servicio } from '../../../models/servicio.interface';
import { Router } from '@angular/router';

@Component({
  selector: 'app-tarjetas-subcategorias',
  standalone: true,
  templateUrl: './tarjetas-subcategorias.html',
  styleUrl: './tarjetas-subcategorias.css',
})

export class TarjetasSubcategorias {

  @Input({ required : true}) info!: Servicio;
  @Input() esCategoriaPrincipal: boolean = false;
  @Input() pathCategoriaPrincipal: string = '';

  private router = inject(Router);

  contratarServicio() {
    if (this.esCategoriaPrincipal) {
      // Si es una categoría principal, navegar a subcategorías
      this.router.navigate(['/pagina-servicios'], {
        queryParams: { pathCategoria: this.info.pathCategoria }
      });
    } else {
      // Si es una subcategoría, navegar a detalles-servicio
      this.router.navigate(['/detalles-servicio'], { 
        queryParams: { 
          id: this.info.id,
          pathCategoria: this.info.pathCategoria,
          pathCategoriaPrincipal: this.pathCategoriaPrincipal 
        } 
      });
    }
  }

}
