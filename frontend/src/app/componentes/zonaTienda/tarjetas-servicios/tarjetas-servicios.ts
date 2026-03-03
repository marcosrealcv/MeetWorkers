import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-tarjetas-servicios',
  standalone: true,
  templateUrl: './tarjetas-servicios.html',
  styleUrl: './tarjetas-servicios.css',
})
export class TarjetasServicios {

  @Input() titulo: String = 'Servicio';
  @Input() descripcion: String = 'Descripción del servicio';
  @Input() imagen: String = 'https://via.placeholder.com/150';
  @Input() categoria: String = 'Categoría';
  @Input() precio: String = '0€';

}
