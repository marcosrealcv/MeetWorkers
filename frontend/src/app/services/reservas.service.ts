import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { JwtService } from './jwt.service';

const API_RESERVAS_URL = 'http://localhost:3000/api/reservas';

export interface Reserva {
  _id?: string;
  prestador_id: string;
  tipo: 'reserva';
  reserva_id?: string;
  trabajo_titulo: string;
  trabajo_descripcion: string;
  categoria: string;
  subcategoria: string;
  ubicacion: string;
  presupuesto?: number;
  cliente_id?: string;
  cliente_nombre: string;
  cliente_email: string;
  cliente_telefono: string;
  fecha_reserva: string;
  hora_reserva: string;
  estado_reserva?: 'pendiente' | 'aceptado' | 'rechazado';
  leido: boolean;
  createdAt?: string;
  updatedAt?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ReservasService {
  private readonly http = inject(HttpClient);
  private readonly jwtService = inject(JwtService);

  private getHeaders(): HttpHeaders {
    const token = this.jwtService.obtenerToken();
    return new HttpHeaders({
      Authorization: `Bearer ${token || ''}`
    });
  }

  crearReserva(reserva: Omit<Reserva, '_id' | 'tipo' | 'leido' | 'createdAt' | 'updatedAt'>) {
    const headers = this.getHeaders();
    return this.http.post<{ mensaje: string; reserva: Reserva }>(
      API_RESERVAS_URL,
      reserva,
      { headers }
    );
  }

  obtenerReservas() {
    const headers = this.getHeaders();
    return this.http.get<Reserva[]>(API_RESERVAS_URL, { headers });
  }

  obtenerReservasPendientes() {
    const headers = this.getHeaders();
    return this.http.get<Reserva[]>(`${API_RESERVAS_URL}/pendientes`, { headers });
  }

  obtenerMisReservas() {
    const headers = this.getHeaders();
    return this.http.get<Reserva[]>(`${API_RESERVAS_URL}/mias`, { headers });
  }

  actualizarEstadoReserva(reservaId: string, estado: 'aceptado' | 'rechazado' | 'pendiente') {
    const headers = this.getHeaders();
    return this.http.put<{ mensaje: string; reserva: Reserva }>(
      `${API_RESERVAS_URL}/${reservaId}`,
      { estado_reserva: estado },
      { headers }
    );
  }

  eliminarReserva(reservaId: string) {
    const headers = this.getHeaders();
    return this.http.delete<{ mensaje: string }>(
      `${API_RESERVAS_URL}/${reservaId}`,
      { headers }
    );
  }
}
