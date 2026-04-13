import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Observable, throwError, timeout } from 'rxjs';
import { EliminarTrabajoResponse, NuevoTrabajoSolicitudPayload, PublicarTrabajoResponse, TrabajoSolicitud } from '../models/trabajo-solicitud.interface';
import { JwtService } from './jwt.service';

const API_TRABAJOS_URL = 'http://localhost:3000/api/trabajos';

@Injectable({
  providedIn: 'root'
})
export class TrabajosService {
  private readonly http = inject(HttpClient);
  private readonly jwtService = inject(JwtService);

  publicarTrabajo(payload: NuevoTrabajoSolicitudPayload): Observable<PublicarTrabajoResponse> {
    const headers = this.obtenerHeadersAutorizadosOpcional();

    if (!headers) {
      return this.http.post<PublicarTrabajoResponse>(API_TRABAJOS_URL, payload).pipe(timeout(15000));
    }

    return this.http.post<PublicarTrabajoResponse>(API_TRABAJOS_URL, payload, { headers }).pipe(timeout(15000));
  }

  obtenerTrabajoPorId(idTrabajo: string): Observable<TrabajoSolicitud> {
    const headers = this.obtenerHeadersAutorizados();

    if (!headers) {
      return throwError(() => new HttpErrorResponse({
        status: 401,
        error: { error: 'No hay una sesión activa, inicia sesión de nuevo' }
      }));
    }

    return this.http.get<TrabajoSolicitud>(`${API_TRABAJOS_URL}/${idTrabajo}`, { headers }).pipe(timeout(10000));
  }

  actualizarTrabajo(idTrabajo: string, payload: NuevoTrabajoSolicitudPayload): Observable<PublicarTrabajoResponse> {
    const headers = this.obtenerHeadersAutorizados();

    if (!headers) {
      return throwError(() => new HttpErrorResponse({
        status: 401,
        error: { error: 'No hay una sesión activa, inicia sesión de nuevo' }
      }));
    }

    return this.http.put<PublicarTrabajoResponse>(`${API_TRABAJOS_URL}/${idTrabajo}`, payload, { headers }).pipe(timeout(15000));
  }

  eliminarTrabajo(idTrabajo: string): Observable<EliminarTrabajoResponse> {
    const headers = this.obtenerHeadersAutorizados();

    if (!headers) {
      return throwError(() => new HttpErrorResponse({
        status: 401,
        error: { error: 'No hay una sesión activa, inicia sesión de nuevo' }
      }));
    }

    return this.http.delete<EliminarTrabajoResponse>(`${API_TRABAJOS_URL}/${idTrabajo}`, { headers }).pipe(timeout(10000));
  }

  obtenerTrabajosPublicados(): Observable<TrabajoSolicitud[]> {
    return this.http.get<TrabajoSolicitud[]>(API_TRABAJOS_URL).pipe(timeout(10000));
  }

  obtenerMisTrabajos(): Observable<TrabajoSolicitud[]> {
    const headers = this.obtenerHeadersAutorizados();

    if (!headers) {
      return throwError(() => new HttpErrorResponse({
        status: 401,
        error: { error: 'No hay una sesión activa, inicia sesión de nuevo' }
      }));
    }

    return this.http.get<TrabajoSolicitud[]>(`${API_TRABAJOS_URL}/mis-trabajos`, { headers }).pipe(timeout(10000));
  }

  private obtenerHeadersAutorizados(): HttpHeaders | null {
    const token = this.jwtService.obtenerToken();

    if (!token) {
      return null;
    }

    return new HttpHeaders({
      Authorization: `Bearer ${token}`
    });
  }

  private obtenerHeadersAutorizadosOpcional(): HttpHeaders | null {
    return this.obtenerHeadersAutorizados();
  }
}