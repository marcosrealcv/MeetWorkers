import { DatePipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { TrabajoSolicitud } from '../../../models/trabajo-solicitud.interface';
import { TrabajosService } from '../../../services/trabajos.service';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-detalle-aviso',
  standalone: true,
  imports: [DatePipe],
  templateUrl: './detalle-aviso.html',
  styleUrl: './detalle-aviso.css',
})
export class DetalleAvisoComponent implements OnInit {
  trabajo: TrabajoSolicitud | null = null;
  cargando = true;
  error = '';
  procesandoAceptacion = false;
  mensajeExito = '';

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly authService: AuthService,
    private readonly trabajosService: TrabajosService,
  ) {}

  ngOnInit(): void {
    const idTrabajo = String(this.route.snapshot.queryParamMap.get('trabajoId') ?? '').trim();
    const detalleTrabajoNavegacion = history.state?.detalleTrabajo as TrabajoSolicitud | undefined;

    if (!idTrabajo) {
      this.error = 'No se encontro el aviso solicitado';
      this.cargando = false;
      return;
    }

    const detalleInicialValido =
      detalleTrabajoNavegacion &&
      typeof detalleTrabajoNavegacion === 'object' &&
      String(detalleTrabajoNavegacion._id ?? '').trim() === idTrabajo;

    if (detalleInicialValido) {
      this.trabajo = detalleTrabajoNavegacion;
      this.cargando = false;
      this.cargarDetalleTrabajo(idTrabajo, false);
      return;
    }

    this.cargarDetalleTrabajo(idTrabajo, true);
  }

  private cargarDetalleTrabajo(idTrabajo: string, mostrarCarga: boolean): void {
    this.cargando = mostrarCarga;
    this.error = '';

    this.trabajosService.obtenerTrabajoPublicoPorId(idTrabajo).pipe(
      finalize(() => {
        this.cargando = false;
      })
    ).subscribe({
      next: (trabajo) => {
        this.trabajo = trabajo;
      },
      error: (error: HttpErrorResponse) => {
        this.error = error.error?.error ?? 'No se pudo cargar el detalle del aviso';
      }
    });
  }

  aceptarTrabajo(): void {
    if (!this.trabajo?._id || this.procesandoAceptacion || !this.esPrestador) {
      return;
    }

    this.procesandoAceptacion = true;
    this.error = '';
    this.mensajeExito = '';

    this.trabajosService.aceptarTrabajoSolicitado(this.trabajo._id).subscribe({
      next: (respuesta) => {
        this.trabajo = respuesta.trabajo;
        this.procesandoAceptacion = false;
        this.mensajeExito = 'Has aceptado este trabajo. El cliente ya recibio el aviso.';
      },
      error: (error: HttpErrorResponse) => {
        this.procesandoAceptacion = false;
        this.error = error.error?.error ?? 'No se pudo aceptar el trabajo';
      }
    });
  }

  volver(): void {
    void this.router.navigate(['/']);
  }

  get esPrestador(): boolean {
    return Boolean(this.authService.clienteActual()?.es_prestador);
  }

  get trabajoAceptado(): boolean {
    return this.trabajo?.estado === 'aceptado';
  }
}
