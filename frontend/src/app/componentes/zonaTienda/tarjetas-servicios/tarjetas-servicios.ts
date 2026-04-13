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
  @Input() tipoTarjeta: 'servicio' | 'trabajo' = 'servicio';

  constructor(private router: Router) {}

  irAServicios() {
    if (this.tipoTarjeta === 'trabajo') {
      this.router.navigate(['/cuenta']);
      return;
    }

    this.router.navigate(['/pagina-servicios'], { queryParams: { pathCategoria: this.info.pathCategoria } });
  }

  get textoBoton(): string {
    return this.tipoTarjeta === 'trabajo' ? 'Ver aviso' : 'Saber mas';
  }

}
