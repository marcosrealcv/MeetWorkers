import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Categoria {
  _id: string;
  nombreCategoria: string;
  pathCategoria: string;
}

export interface Subcategoria {
  _id: string;
  nombreCategoria: string;
  pathCategoria: string;
}

export interface Prestador {
  _id: string;
  nombre: string;
  apellido: string;
  descripcion_servicio?: string;
  coste_hora?: number;
  subcategoria?: string;
  categoria?: string;
}

@Injectable({
  providedIn: 'root'
})
export class CategoriasService {
  
  private apiUrl = 'http://localhost:3000/api';

  constructor(private http: HttpClient) { }

  // Obtener categorías principales
  obtenerCategorias(): Observable<Categoria[]> {
    return this.http.get<Categoria[]>(`${this.apiUrl}/categorias`);
  }

  // Obtener subcategorías por categoría
  obtenerSubcategorias(pathCategoria: string): Observable<Subcategoria[]> {
    return this.http.get<Subcategoria[]>(`${this.apiUrl}/subcategorias/${pathCategoria}`);
  }

  // Obtener prestadores por subcategoría
  obtenerPrestadoresPorSubcategoria(pathCategoria: string): Observable<Prestador[]> {
    return this.http.get<Prestador[]>(`${this.apiUrl}/prestadores-categoria/${pathCategoria}`);
  }

  // Obtener todos los prestadores
  obtenerTodosPrestadores(): Observable<Prestador[]> {
    return this.http.get<Prestador[]>(`${this.apiUrl}/prestadores`);
  }
}
