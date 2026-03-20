import { Injectable } from '@angular/core';
import { Proveedor } from '../models/proveedor.interface';

@Injectable({
  providedIn: 'root'
})
export class ProveedoresService {

  private proveedoresPorServicio: { [key: number]: Proveedor[] } = {
    1: [
      {
        id: 101,
        nombre: 'Juan García',
        especialidad: 'Mecánico profesional',
        rating: 4.9,
        resenas: 128,
        precio: '45€/hora',
        imagen: '/imgs/mecanico.png',
        experiencia: '15 años de experiencia'
      },
      {
        id: 102,
        nombre: 'Carlos López',
        especialidad: 'Especialista en motores',
        rating: 4.8,
        resenas: 95,
        precio: '48€/hora',
        imagen: '/imgs/mecanico.png',
        experiencia: '12 años de experiencia'
      },
      {
        id: 103,
        nombre: 'Manuel Ruiz',
        especialidad: 'Mantenimiento general',
        rating: 4.7,
        resenas: 87,
        precio: '40€/hora',
        imagen: '/imgs/mecanico.png',
        experiencia: '10 años de experiencia'
      }
    ],
    2: [
      {
        id: 104,
        nombre: 'Roberto Fernández',
        especialidad: 'Electricista auto especializado',
        rating: 4.9,
        resenas: 112,
        precio: '50€/hora',
        imagen: '/imgs/mecanico.png',
        experiencia: '14 años de experiencia'
      },
      {
        id: 105,
        nombre: 'David Morales',
        especialidad: 'Sistemas eléctricos avanzados',
        rating: 4.8,
        resenas: 78,
        precio: '55€/hora',
        imagen: '/imgs/mecanico.png',
        experiencia: '11 años de experiencia'
      }
    ],
    3: [
      {
        id: 106,
        nombre: 'María Sánchez',
        especialidad: 'Limpieza integral del hogar',
        rating: 4.9,
        resenas: 156,
        precio: '35€/hora',
        imagen: '/imgs/limpieza.png',
        experiencia: '8 años de experiencia'
      },
      {
        id: 107,
        nombre: 'Rosa Martínez',
        especialidad: 'Limpieza ecológica',
        rating: 4.8,
        resenas: 104,
        precio: '38€/hora',
        imagen: '/imgs/limpieza.png',
        experiencia: '7 años de experiencia'
      }
    ],
    4: [
      {
        id: 108,
        nombre: 'Patricia García',
        especialidad: 'Limpieza de oficinas profesional',
        rating: 4.9,
        resenas: 98,
        precio: '40€/hora',
        imagen: '/imgs/limpieza.png',
        experiencia: '9 años de experiencia'
      },
      {
        id: 109,
        nombre: 'Lucía Rodríguez',
        especialidad: 'Desinfección y limpieza',
        rating: 4.7,
        resenas: 67,
        precio: '42€/hora',
        imagen: '/imgs/limpieza.png',
        experiencia: '6 años de experiencia'
      }
    ],
    5: [
      {
        id: 110,
        nombre: 'Sofia Peluquera',
        especialidad: 'Peluquería y estilismo',
        rating: 4.9,
        resenas: 187,
        precio: '20€/servicio',
        imagen: '/imgs/peluqueria.png',
        experiencia: '12 años de experiencia'
      },
      {
        id: 111,
        nombre: 'Alejandra López',
        especialidad: 'Color y tratamientos',
        rating: 4.8,
        resenas: 142,
        precio: '25€/servicio',
        imagen: '/imgs/peluqueria.png',
        experiencia: '10 años de experiencia'
      }
    ],
    6: [
      {
        id: 112,
        nombre: 'Beatriz Uñas',
        especialidad: 'Manicura y decoración',
        rating: 4.9,
        resenas: 165,
        precio: '15€/servicio',
        imagen: '/imgs/peluqueria.png',
        experiencia: '9 años de experiencia'
      },
      {
        id: 113,
        nombre: 'Lucia Estética',
        especialidad: 'Diseño de uñas',
        rating: 4.8,
        resenas: 98,
        precio: '18€/servicio',
        imagen: '/imgs/peluqueria.png',
        experiencia: '7 años de experiencia'
      }
    ]
  };

  constructor() { }

  // Obtener proveedores por ID de servicio
  obtenerProveedoresPorServicio(servicioId: number): Proveedor[] {
    return this.proveedoresPorServicio[servicioId] || [];
  }

  // Obtener proveedor por ID
  obtenerProveedorPorId(proveedorId: number): Proveedor | undefined {
    for (const proveedores of Object.values(this.proveedoresPorServicio)) {
      const proveedor = proveedores.find(p => p.id === proveedorId);
      if (proveedor) return proveedor;
    }
    return undefined;
  }

  // Obtener todos los proveedores
  obtenerTodos(): Proveedor[] {
    const todos: Proveedor[] = [];
    for (const proveedores of Object.values(this.proveedoresPorServicio)) {
      todos.push(...proveedores);
    }
    return todos;
  }
}
