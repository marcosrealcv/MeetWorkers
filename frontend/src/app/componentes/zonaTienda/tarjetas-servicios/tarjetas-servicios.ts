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
      if (!this.info.trabajoId || this.trabajoAceptado) {
        return;
      }

      this.router.navigate(['/detalle-aviso'], {
        queryParams: { trabajoId: this.info.trabajoId },
        state: { detalleTrabajo: this.info.detalleTrabajo }
      });
      return;
    }

    this.router.navigate(['/pagina-servicios'], { queryParams: { pathCategoria: this.info.pathCategoria } });
  }

  get textoBoton(): string {
    if (this.tipoTarjeta === 'trabajo') {
      return this.trabajoAceptado ? 'Ya aceptado' : 'Ver aviso';
    }

    return 'Saber mas';
  }

  get trabajoAceptado(): boolean {
    return this.tipoTarjeta === 'trabajo' && this.info.estadoTrabajo === 'aceptado';
  }

}
