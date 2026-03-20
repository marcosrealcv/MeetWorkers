import { Component, Input } from '@angular/core';
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

  constructor(private router: Router) {}

  contratarServicio() {
    this.router.navigate(['/detalles-servicio'], { queryParams: { id: this.info.id } });
  }

}
