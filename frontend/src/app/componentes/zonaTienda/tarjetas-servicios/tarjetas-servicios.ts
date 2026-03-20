import { Component, Input } from '@angular/core';
import { Servicio } from '../../../models/servicio.interface';
import { Router } from "@angular/router";

@Component({
  selector: 'app-tarjetas-servicios',
  standalone: true,
  templateUrl: './tarjetas-servicios.html',
  styleUrl: './tarjetas-servicios.css',
})

export class TarjetasServicios {

  @Input({ required : true}) info!: Servicio;

  constructor(private router: Router) {}

  irAServicios() {
    this.router.navigate(['/pagina-servicios'], { queryParams: { pathCategoria: this.info.pathCategoria } });
  }

}
