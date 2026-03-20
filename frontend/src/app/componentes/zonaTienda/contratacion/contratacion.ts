import { Component, signal, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Proveedor } from '../../../models/proveedor.interface';
import { ProveedoresService } from '../../../services/proveedores.service';

@Component({
  selector: 'app-contratacion',
  standalone: true,
  templateUrl: './contratacion.html',
  styleUrl: './contratacion.css',
})
export class ContratacionComponent implements OnInit {
  proveedor = signal<Proveedor | null>(null);

  constructor(
    private route: ActivatedRoute,
    private proveedoresService: ProveedoresService
  ) {}

  ngOnInit() {
    this.route.queryParamMap.subscribe(params => {
      const proveedorId = params.get('proveedorId');
      if (proveedorId) {
        const proveedor = this.proveedoresService.obtenerProveedorPorId(Number(proveedorId));
        this.proveedor.set(proveedor || null);
      }
    });
  }
}

