import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Proveedor } from '../../../models/proveedor.interface';
import { Router } from '@angular/router';
import { ReservasService } from '../../../services/reservas.service';

@Component({
  selector: 'app-tarjeta-proveedor',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './tarjeta-proveedor.html',
  styleUrl: './tarjeta-proveedor.css',
})
export class TarjetaProveedorComponent implements OnInit {

  @Input({ required: true }) proveedor!: Proveedor;

  cargandoResenas = false;
  promedioCalificacion = 0;
  totalResenas = 0;

  constructor(
    private router: Router,
    private reservasService: ReservasService
  ) {}

  ngOnInit(): void {
    this.cargarResenas();
  }

  private cargarResenas(): void {
    this.cargandoResenas = true;

    this.reservasService.obtenerResenasPrestador(this.proveedor.id).subscribe({
      next: (resenas) => {
        this.proveedor.resenasDetalladas = resenas;
        this.totalResenas = resenas.length;
        
        if (resenas.length > 0) {
          const suma = resenas.reduce((total, resena) => total + (resena.resena_calificacion || 0), 0);
          this.promedioCalificacion = suma / resenas.length;
        } else {
          this.promedioCalificacion = 0;
        }
        
        this.cargandoResenas = false;
      },
      error: () => {
        this.cargandoResenas = false;
        this.proveedor.resenasDetalladas = [];
      }
    });
  }

  contratarProveedor() {
    this.router.navigate(['/contratacion'], {
      queryParams: {
        proveedorId: this.proveedor.id,
        nombre: this.proveedor.nombre,
        especialidad: this.proveedor.especialidad,
        rating: this.proveedor.rating,
        resenas: this.proveedor.resenas,
        precio: this.proveedor.precio,
        imagen: this.proveedor.imagen,
        experiencia: this.proveedor.experiencia,
      },
    });
  }

}
