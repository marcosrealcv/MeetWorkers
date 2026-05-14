import { Component, Input, OnInit, ChangeDetectorRef } from '@angular/core';
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
    private reservasService: ReservasService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    console.log('tarjeta-proveedor ngOnInit - Proveedor ID:', this.proveedor.id);
    this.cargarResenas();
  }

  private cargarResenas(): void {
    console.log('Cargando reseñas para prestador:', this.proveedor.id);
    this.cargandoResenas = true;

    this.reservasService.obtenerResenasPrestador(this.proveedor.id).subscribe({
      next: (resenas) => {
        console.log('Reseñas recibidas:', resenas);
        this.proveedor.resenasDetalladas = resenas;
        this.totalResenas = resenas.length;
        
        if (resenas.length > 0) {
          const suma = resenas.reduce((total, resena) => total + (resena.resena_calificacion || 0), 0);
          this.promedioCalificacion = suma / resenas.length;
          this.proveedor.rating = Number(this.promedioCalificacion.toFixed(1));
          this.proveedor.resenas = this.totalResenas;
        } else {
          this.promedioCalificacion = 0;
          this.proveedor.rating = 0;
          this.proveedor.resenas = 0;
        }
        
        console.log('Proveedor actualizado:', this.proveedor);
        this.cargandoResenas = false;
        this.cdr.markForCheck();
      },
      error: (error) => {
        console.error('Error cargando reseñas:', error);
        this.cargandoResenas = false;
        this.proveedor.resenasDetalladas = [];
        this.proveedor.rating = 0;
        this.proveedor.resenas = 0;
        this.cdr.markForCheck();
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
