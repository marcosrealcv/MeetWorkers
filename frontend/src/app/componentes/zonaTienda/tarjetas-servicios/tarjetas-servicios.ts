import { Component, Input } from '@angular/core';
import { Servicio } from '../../../models/servicio.interface';

@Component({
  selector: 'app-tarjetas-servicios',
  standalone: true,
  templateUrl: './tarjetas-servicios.html',
  styleUrl: './tarjetas-servicios.css',
})
export class TarjetasServicios {

  @Input({ required : true}) info!: Servicio;

}
