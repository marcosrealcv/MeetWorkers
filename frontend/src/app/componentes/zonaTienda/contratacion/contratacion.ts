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
      const nombre = params.get('nombre');
      const especialidad = params.get('especialidad');
      const rating = params.get('rating');
      const resenas = params.get('resenas');
      const precio = params.get('precio');
      const imagen = params.get('imagen');
      const experiencia = params.get('experiencia');

      if (proveedorId && nombre && especialidad && rating && resenas && precio && imagen && experiencia) {
        this.proveedor.set({
          id: Number(proveedorId),
          nombre,
          especialidad,
          rating: Number(rating),
          resenas: Number(resenas),
          precio,
          imagen,
          experiencia,
        });
        return;
      }

      if (proveedorId) {
        const proveedor = this.proveedoresService.obtenerProveedorPorId(Number(proveedorId));
        this.proveedor.set(proveedor || null);
        return;
      }

      this.proveedor.set(null);
    });
  }
}

