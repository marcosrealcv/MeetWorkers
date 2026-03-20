import { Component, Input } from '@angular/core';
import { Proveedor } from '../../../models/proveedor.interface';
import { Router } from '@angular/router';

@Component({
  selector: 'app-tarjeta-proveedor',
  standalone: true,
  templateUrl: './tarjeta-proveedor.html',
  styleUrl: './tarjeta-proveedor.css',
})
export class TarjetaProveedorComponent {

  @Input({ required: true }) proveedor!: Proveedor;

  constructor(private router: Router) {}

  contratarProveedor() {
    this.router.navigate(['/contratacion'], { queryParams: { proveedorId: this.proveedor.id } });
  }

}
