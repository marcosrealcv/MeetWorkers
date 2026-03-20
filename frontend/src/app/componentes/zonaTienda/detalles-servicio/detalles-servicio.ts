import { Component, signal, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Servicio } from '../../../models/servicio.interface';
import { Proveedor } from '../../../models/proveedor.interface';
import { ServiciosService } from '../../../services/servicios.service';
import { ProveedoresService } from '../../../services/proveedores.service';
import { TarjetaProveedorComponent } from '../tarjeta-proveedor/tarjeta-proveedor';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-detalles-servicio',
  standalone: true,
  imports: [TarjetaProveedorComponent, CommonModule],
  templateUrl: './detalles-servicio.html',
  styleUrl: './detalles-servicio.css',
})
export class DetallesServicioComponent implements OnInit {
  servicio = signal<Servicio | null>(null);
  proveedores = signal<Proveedor[]>([]);

  constructor(
    private route: ActivatedRoute,
    private serviciosService: ServiciosService,
    private proveedoresService: ProveedoresService
  ) {}

  ngOnInit() {
    this.route.queryParamMap.subscribe(params => {
      const servicioId = params.get('id');
      if (servicioId) {
        const servicio = this.serviciosService.obtenerPorId(Number(servicioId));
        this.servicio.set(servicio || null);
        
        // Obtener proveedores para este servicio
        const proveedores = this.proveedoresService.obtenerProveedoresPorServicio(Number(servicioId));
        this.proveedores.set(proveedores);
      }
    });
  }
}

