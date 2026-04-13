import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, timeout } from 'rxjs';
import { AvisoPrestador, EliminarAvisoResponse } from '../models/aviso.interface';
import { JwtService } from './jwt.service';

const API_AVISOS_URL = 'http://localhost:3000/api/avisos';

@Injectable({
  providedIn: 'root'
})
export class AvisosService {
  private readonly http = inject(HttpClient);
  private readonly jwtService = inject(JwtService);

  obtenerMisAvisos(): Observable<AvisoPrestador[]> {
    const headers = this.obtenerHeadersAutorizados();

    if (!headers) {
      return throwError(() => new HttpErrorResponse({
        status: 401,
        error: { error: 'No hay una sesión activa, inicia sesión de nuevo' }
      }));
    }

    return this.http.get<AvisoPrestador[]>(`${API_AVISOS_URL}/mis-avisos`, { headers }).pipe(timeout(10000));
  }

  marcarAvisoLeido(idAviso: string): Observable<AvisoPrestador> {
    const headers = this.obtenerHeadersAutorizados();

    if (!headers) {
      return throwError(() => new HttpErrorResponse({
        status: 401,
        error: { error: 'No hay una sesión activa, inicia sesión de nuevo' }
      }));
    }

    return this.http.put<AvisoPrestador>(`${API_AVISOS_URL}/${idAviso}/leido`, {}, { headers }).pipe(timeout(10000));
  }

  eliminarAviso(idAviso: string): Observable<EliminarAvisoResponse> {
    const headers = this.obtenerHeadersAutorizados();

    if (!headers) {
      return throwError(() => new HttpErrorResponse({
        status: 401,
        error: { error: 'No hay una sesión activa, inicia sesión de nuevo' }
      }));
    }

    return this.http.delete<EliminarAvisoResponse>(`${API_AVISOS_URL}/${idAviso}`, { headers }).pipe(timeout(10000));
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
}