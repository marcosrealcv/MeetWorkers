import { Component, signal, OnInit } from '@angular/core';
import { TarjetasServicios } from '../tarjetas-servicios/tarjetas-servicios';
import { Servicio } from '../../../models/servicio.interface';
import { ServiciosService } from '../../../services/servicios.service';

@Component({
  selector: 'app-inicio',
  standalone: true,
  imports: [TarjetasServicios],
  templateUrl: './inicio.html',
  styleUrl: './inicio.css',
})
export class Inicio implements OnInit {
  servicios = signal<Servicio[]>([]);

  constructor(private serviciosService: ServiciosService) {}

  ngOnInit() {
    this.servicios.set(this.serviciosService.obtenerPrincipales());
  }
}
