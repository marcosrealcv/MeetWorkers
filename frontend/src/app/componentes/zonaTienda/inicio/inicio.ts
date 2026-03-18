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
      precio: 45 + '€',
      categoria: 'Automoción',
      imagen: '/imgs/mecanico.png',
      rating: 4.8
    },
    {
      id: 2,
      nombre: 'Limpieza a domicilio',
      descripcion: 'Servicio completo de limpieza y desinfección de tu hogar.',
      precio: 35 + '€',
      categoria: 'Limpieza',
      imagen: '/imgs/limpieza.png',
      rating: 4.9
    },
    {
      id: 3,
      nombre: 'Peluquería',
      descripcion: 'Corte de cabello, peinados y tratamientos de belleza a domicilio.',
      precio: 20 + '€',
      categoria: 'Belleza',
      imagen: '/imgs/peluqueria.png',
      rating: 4.7
    },
    ]);
}
