import { Component, signal } from '@angular/core';
import { TarjetasServicios } from '../tarjetas-servicios/tarjetas-servicios';
import { Servicio } from '../../../models/servicio.interface';

@Component({
  selector: 'app-inicio',
  standalone: true,
  imports: [TarjetasServicios],
  templateUrl: './inicio.html',
  styleUrl: './inicio.css',
})
export class Inicio {
  servicios = signal<Servicio[]>([
    {
      id: 1,
      nombre: 'Mecánico a domicilio',
      descripcion: 'Cambio de aceite y revisión de frenos en tu propio garaje.',
      precio: 45,
      categoria: 'Automoción',
      imagen: 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?q=80&w=500',
      rating: 4.8
    },
    ]);
}
