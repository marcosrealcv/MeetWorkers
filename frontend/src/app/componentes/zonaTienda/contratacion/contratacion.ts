import { Component, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Proveedor } from '../../../models/proveedor.interface';
import { ProveedoresService } from '../../../services/proveedores.service';
import { DisponibilidadService } from '../../../services/disponibilidad.service';
import { ReservasService } from '../../../services/reservas.service';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-contratacion',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './contratacion.html',
  styleUrl: './contratacion.css',
})
export class ContratacionComponent implements OnInit {
  proveedor = signal<Proveedor | null>(null);
  mostrarCalendario = signal(false);
  diasDisponibles = signal<string[]>([]);
  franjas = signal<string[]>([]);
  fechaSeleccionada = signal<string>('');
  horaSeleccionada = signal<string>('');
  isSubmitting = signal(false);
  submitted = signal(false);
  formulario = signal({
    nombre: '',
    email: '',
    telefono: '',
    descripcion: '',
  });

  constructor(
    private route: ActivatedRoute,
    private proveedoresService: ProveedoresService,
    private disponibilidadService: DisponibilidadService,
    private reservasService: ReservasService,
    private authService: AuthService
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
          id: proveedorId, // Ya es string desde los query params
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

      if (proveedorId && typeof proveedorId === 'string') {
        // El proveedorId es un string (_id de MongoDB)
        this.proveedoresService.obtenerProveedorPorId(proveedorId)?.subscribe({
          next: (prestadorReal) => {
            this.proveedor.set({
              id: prestadorReal._id,
              nombre: `${prestadorReal.nombre} ${prestadorReal.apellido || ''}`,
              especialidad: prestadorReal.subcategoria || 'Especialista',
              rating: 0,
              resenas: 0,
              precio: `${prestadorReal.coste_hora}€/hora`,
              imagen: '/imgs/proveedor.png',
              experiencia: 'Prestador verificado'
            });
          },
          error: (err) => {
            console.error('Error cargando proveedor:', err);
            this.proveedor.set(null);
          }
        });
        return;
      }

      this.proveedor.set(null);
    });

    // Pre-rellenar datos del cliente autenticado si existen
    const clienteActual = this.authService.clienteActual();
    if (clienteActual) {
      this.formulario.update(form => ({
        ...form,
        nombre: clienteActual.nombre || '',
        email: clienteActual.email || '',
        telefono: clienteActual.telefono || '',
      }));
    }
  }

  abrirCalendario() {
    this.diasDisponibles.set(this.disponibilidadService.generarDiasDisponibles());
    this.franjas.set(this.disponibilidadService.generarFranjas());
    this.mostrarCalendario.set(true);
  }

  confirmarDisponibilidad() {
    if (!this.fechaSeleccionada() || !this.horaSeleccionada()) {
      alert('Por favor selecciona una fecha y hora');
      return;
    }

    const disponibilidad = this.disponibilidadService.obtenerDisponibilidadFormato(
      this.fechaSeleccionada(),
      this.horaSeleccionada()
    );

    this.formulario.update(form => ({
      ...form,
      descripcion: form.descripcion ? 
        form.descripcion + `\n\nDisponibilidad seleccionada: ${disponibilidad}` :
        `Disponibilidad seleccionada: ${disponibilidad}`
    }));

    // Solo cerrar el modal sin limpiar los valores
    this.mostrarCalendario.set(false);
  }

  cerrarCalendario() {
    this.mostrarCalendario.set(false);
    this.fechaSeleccionada.set('');
    this.horaSeleccionada.set('');
  }

  seleccionarFecha(fecha: string) {
    this.fechaSeleccionada.set(fecha);
  }

  seleccionarHora(hora: string) {
    this.horaSeleccionada.set(hora);
  }

  actualizarFormulario(campo: string, valor: string) {
    this.formulario.update(form => ({
      ...form,
      [campo]: valor
    }));
  }

  actualizarFormularioDesdeEvento(campo: string, evento: Event) {
    const valor = (evento.target as HTMLInputElement | HTMLTextAreaElement).value;
    this.actualizarFormulario(campo, valor);
  }

  confirmarContratacion() {
    const { nombre, email, telefono, descripcion } = this.formulario();

    if (!nombre || !email || !telefono || !descripcion) {
      alert('Por favor completa todos los campos');
      return;
    }

    if (!this.fechaSeleccionada() || !this.horaSeleccionada()) {
      alert('Por favor selecciona una fecha y hora de disponibilidad');
      return;
    }

    if (!this.proveedor() || !this.proveedor()?.id) {
      alert('Información del proveedor no válida');
      return;
    }

    this.isSubmitting.set(true);

    // Crear objeto de reserva con el ID del proveedor
    const reserva = {
      prestador_id: String(this.proveedor()!.id),
      trabajo_titulo: this.proveedor()!.especialidad,
      trabajo_descripcion: descripcion,
      categoria: this.proveedor()!.especialidad,
      subcategoria: this.proveedor()!.especialidad,
      ubicacion: 'Por confirmar',
      presupuesto: this.proveedor()!.precio ? parseInt(this.proveedor()!.precio.replace(/[^\d]/g, '')) || 0 : 0,
      cliente_nombre: nombre,
      cliente_email: email,
      cliente_telefono: telefono,
      fecha_reserva: this.fechaSeleccionada(),
      hora_reserva: this.horaSeleccionada(),
    };

    this.reservasService.crearReserva(reserva).subscribe({
      next: (response) => {
        this.isSubmitting.set(false);
        this.submitted.set(true);

        alert(`¡Contratación solicitada a ${this.proveedor()?.nombre}! El prestador será notificado y se comunicará contigo.`);

        // Limpiar formulario después de 2 segundos
        setTimeout(() => {
          this.submitted.set(false);
          this.formulario.set({
            nombre,
            email,
            telefono,
            descripcion: '',
          });
          this.fechaSeleccionada.set('');
          this.horaSeleccionada.set('');
        }, 2000);
      },
      error: (error) => {
        this.isSubmitting.set(false);
        console.error('Error al crear reserva:', error);
        alert('Error al crear la reserva. Por favor intenta de nuevo.');
      }
    });
  }
}

