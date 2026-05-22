import { computed, inject, Injectable, signal } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { tap, throwError } from 'rxjs';
import { AuthResponse, Cliente, LoginPayload, RegistroClientePayload } from '../models/cliente.interface';
import { JwtService } from './jwt.service';


const API_CLIENTES_URL = 'http://localhost:3000/api/clientes';
const CLIENTE_STORAGE_KEY = 'meetworkers_cliente';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly jwtService = inject(JwtService);

  private readonly clienteSignal = signal<Cliente | null>(this.leerClienteDesdeStorage());

  readonly clienteActual = this.clienteSignal.asReadonly();
  readonly estaAutenticado = computed(() => this.clienteSignal() !== null && this.jwtService.tieneToken());

  constructor() {
    this.normalizarSesionInicial();
  }

  registrarCliente(payload: RegistroClientePayload) {
    return this.http.post<AuthResponse>(`${API_CLIENTES_URL}/registro`, payload);
  }

  iniciarSesion(payload: LoginPayload) {
    return this.http.post<AuthResponse>(`${API_CLIENTES_URL}/login`, payload).pipe(
      tap((response) => {
        this.guardarSesion(response.cliente, response.token);
      })
    );
  }

  restablecerContrasena(payload: { email: string; nuevaContrasena: string }) {
    return this.http.post<{ mensaje: string }>(`${API_CLIENTES_URL}/restablecer-contrasena`, payload);
  }

  cargarPerfilCliente() {
    const token = this.jwtService.obtenerToken();

    if (!token) {
      this.cerrarSesion();
      return throwError(() => new HttpErrorResponse({
        status: 401,
        error: { error: 'No hay una sesión activa, inicia sesión de nuevo' }
      }));
    }

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`
    });

    return this.http.get<Cliente>(`${API_CLIENTES_URL}/perfil`, { headers }).pipe(
      tap((cliente) => {
        this.guardarSesion(cliente, token);
      })
    );
  }

  actualizarPerfilCliente(payload: Partial<Cliente>) {
    const token = this.jwtService.obtenerToken();

    if (!token) {
      this.cerrarSesion();
      return throwError(() => new HttpErrorResponse({
        status: 401,
        error: { error: 'No hay una sesión activa, inicia sesión de nuevo' }
      }));
    }

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`
    });

    return this.http.put<Cliente>(`${API_CLIENTES_URL}/perfil`, payload, { headers }).pipe(
      tap((cliente) => {
        this.guardarSesion(cliente, token);
      })
    );
  }

  cerrarSesion(): void {
    this.jwtService.eliminarToken();
    localStorage.removeItem(CLIENTE_STORAGE_KEY);
    this.clienteSignal.set(null);
  }

  private guardarSesion(cliente: Cliente, token: string): void {
    this.jwtService.guardarToken(token);
    const clienteParaPersistir = this.clienteParaPersistencia(cliente);

    try {
      localStorage.setItem(CLIENTE_STORAGE_KEY, JSON.stringify(clienteParaPersistir));
    } catch (error) {
      localStorage.removeItem(CLIENTE_STORAGE_KEY);
      localStorage.setItem(CLIENTE_STORAGE_KEY, JSON.stringify(this.clienteParaPersistenciaMinimal(cliente)));
    }

    this.clienteSignal.set(cliente);
  }

  private leerClienteDesdeStorage(): Cliente | null {
    const clienteGuardado = localStorage.getItem(CLIENTE_STORAGE_KEY);

    if (!clienteGuardado) {
      return null;
    }

    try {
      const cliente = JSON.parse(clienteGuardado) as Cliente;

      if (typeof cliente?._id !== 'string' || cliente._id.trim() === '') {
        localStorage.removeItem(CLIENTE_STORAGE_KEY);
        return null;
      }

      return cliente;
    } catch {
      localStorage.removeItem(CLIENTE_STORAGE_KEY);
      return null;
    }
  }

  private clienteParaPersistencia(cliente: Cliente): Partial<Cliente> {
    const { foto_perfil, ...clienteSinFoto } = cliente;
    return clienteSinFoto;
  }

  private clienteParaPersistenciaMinimal(cliente: Cliente): Partial<Cliente> {
    return {
      _id: cliente._id,
      nombre: cliente.nombre,
      apellido: cliente.apellido,
      telefono: cliente.telefono,
      email: cliente.email,
      direccion: cliente.direccion,
      descripcion: cliente.descripcion,
      es_prestador: cliente.es_prestador,
      tipo_servicio: cliente.tipo_servicio,
      categoria: cliente.categoria,
      subcategoria: cliente.subcategoria,
      descripcion_servicio: cliente.descripcion_servicio,
      ubicacion_servicio: cliente.ubicacion_servicio,
      direccion_servicio: cliente.direccion_servicio,
      coste_hora: cliente.coste_hora,
      trabajos_solicitados: cliente.trabajos_solicitados,
    };
  }

  private normalizarSesionInicial(): void {
    const token = this.jwtService.obtenerToken();
    const cliente = this.clienteSignal();

    if (!token && cliente) {
      localStorage.removeItem(CLIENTE_STORAGE_KEY);
      this.clienteSignal.set(null);
    }
  }
}
