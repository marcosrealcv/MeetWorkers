import { Injectable } from '@angular/core';
import { Servicio } from '../models/servicio.interface';

@Injectable({
  providedIn: 'root'
})
export class ServiciosService {
  
  private todosLosServicios: Servicio[] = [
    // Categorias Generales
    {
      id: 1,
      nombre: 'Automocion',
      descripcion: 'Cambio de aceite y revisión de frenos en tu propio garaje.',
      precio: '45€',
      categoria: 'Automoción',
      pathCategoria: '1-1',
      imagen: '/imgs/mecanico.png',
      rating: 4.8
    },
    {
      id: 3,
      nombre: 'Limpieza',
      descripcion: 'Servicio completo de limpieza y desinfección de tu hogar.',
      precio: '35€',
      categoria: 'Limpieza',
      pathCategoria: '5-1',
      imagen: '/imgs/limpieza.png',
      rating: 4.9
    },
    {
      id: 5,
      nombre: 'Belleza',
      descripcion: 'Corte de cabello, peinados y tratamientos de belleza a domicilio.',
      precio: '20€',
      categoria: 'Belleza',
      pathCategoria: '2-1',
      imagen: '/imgs/peluqueria.png',
      rating: 4.7
    },

    //Subcategorias

    {
      id: 2,
      nombre: 'Electricista del automóvil',
      descripcion: 'Reparación y mantenimiento de sistemas eléctricos del vehículo.',
      precio: '50€',
      categoria: 'Automoción',
      pathCategoria: '1-2',
      imagen: '/imgs/mecanico.png',
      rating: 4.7
    },
    // Limpieza
    
    {
      id: 4,
      nombre: 'Limpieza de oficinas',
      descripcion: 'Servicio profesional de limpieza y desinfección de espacios comerciales.',
      precio: '40€',
      categoria: 'Limpieza',
      pathCategoria: '5-2',
      imagen: '/imgs/limpieza.png',
      rating: 4.8
    },
    // Belleza
    
    {
      id: 6,
      nombre: 'Manicura',
      descripcion: 'Cuidado y embellecimiento de uñas de manos profesional.',
      precio: '15€',
      categoria: 'Belleza',
      pathCategoria: '2-2',
      imagen: '/imgs/peluqueria.png',
      rating: 4.6
    }
  ];

  constructor() { }

  // Obtener todos los servicios
  obtenerTodos(): Servicio[] {
    return this.todosLosServicios;
  }

  // Obtener solo servicios principales (sin subcategorías anidadas)
  obtenerPrincipales(): Servicio[] {
    return this.todosLosServicios.filter(s => {
      const partes = s.pathCategoria.split('-');
      return partes.length === 2 && partes[1] === '1';
    });
  }

  // Filtrar por pathCategoria: devuelve subcategorías excluyendo la principal
  filtrarPorPathCategoria(pathCategoria: string): Servicio[] {
    // Extraer el prefijo principal (ej: '1-1' → '1')
    const prefijo = pathCategoria.split('-')[0];
    // Devolver servicios de esa categoría pero excluyendo la principal (X-1)
    return this.todosLosServicios.filter(s => {
      const partes = s.pathCategoria.split('-');
      // Que pertenezca a la categoría principal Y que no sea la subcategoría principal (que no termine en '-1')
      return partes[0] === prefijo && !(partes[1] === '1');
    });
  }

  // Obtener servicio por id
  obtenerPorId(id: number): Servicio | undefined {
    return this.todosLosServicios.find(s => s.id === id);
  }
}
