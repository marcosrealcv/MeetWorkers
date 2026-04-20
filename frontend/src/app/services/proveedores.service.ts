import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Proveedor } from '../models/proveedor.interface';

export interface PrestadorBD {
  _id: string;
  nombre: string;
  apellido: string;
  email: string;
  categoria: string;
  subcategoria: string;
  coste_hora: number;
  descripcion_servicio?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ProveedoresService {
  private readonly http = inject(HttpClient);

  obtenerPrestadores() {
    return this.http.get<PrestadorBD[]>('http://localhost:3000/api/clientes/prestadores');
  }

  buscarPrestadorPorNombre(nombre: string) {
    return this.http.get<PrestadorBD>(`http://localhost:3000/api/clientes/buscar/prestador/${encodeURIComponent(nombre)}`);
  }

  // Obtener proveedor por ID (ahora busca en BD por _id)
  obtenerProveedorPorId(proveedorId: string) {
    // Si recibe el formato antiguo (número), devuelve null para forzar traer datos reales
    if (typeof proveedorId === 'string' && proveedorId.includes('ObjectId')) {
      return this.http.get<PrestadorBD>(`http://localhost:3000/api/clientes/${proveedorId}`);
    }
    return null;
  }

  // Obtener todos los proveedores (reales)
  obtenerTodos() {
    return this.http.get<PrestadorBD[]>('http://localhost:3000/api/clientes/prestadores');
  }

  // Obtener proveedores por servicio (categoría)
  obtenerProveedoresPorServicio(categoria: string) {
    return this.http.get<PrestadorBD[]>('http://localhost:3000/api/clientes/prestadores');
  }
}
