import { Injectable } from '@angular/core';
import { signal } from '@angular/core';

export interface HorarioDisponible {
  fecha: string;
  hora: string;
  disponible: boolean;
}

export interface DisponibilidadProveedor {
  diasDisponibles: string[];
  franjas: string[];
}

@Injectable({
  providedIn: 'root'
})
export class DisponibilidadService {
  private readonly FRANJA_HORARIA = [
    '09:00', '10:00', '11:00', '12:00',
    '14:00', '15:00', '16:00', '17:00', '18:00'
  ];

  private readonly API_KEY = ''; // Se configurará desde el backend

  generarFranjas(): string[] {
    return this.FRANJA_HORARIA;
  }

  generarDiasDisponibles(diasAdelante: number = 30): string[] {
    const dias: string[] = [];
    const hoy = new Date();
    hoy.setDate(hoy.getDate() + 1); // Empezar desde mañana

    for (let i = 0; i < diasAdelante; i++) {
      const fecha = new Date(hoy);
      fecha.setDate(fecha.getDate() + i);

      // Evitar domingos (0) y sábados (6)
      if (fecha.getDay() !== 0 && fecha.getDay() !== 6) {
        dias.push(fecha.toISOString().split('T')[0]);
      }
    }

    return dias;
  }

  obtenerDisponibilidadFormato(fecha: string, hora: string): string {
    const [year, month, day] = fecha.split('-');
    const [horas, minutos] = hora.split(':');
    return `${day}/${month}/${year} ${horas}:${minutos}`;
  }

  validarFechaYHora(fecha: string, hora: string): boolean {
    const fechaSeleccionada = new Date(fecha);
    const ahora = new Date();

    if (fechaSeleccionada <= ahora) {
      return false;
    }

    return true;
  }
}
