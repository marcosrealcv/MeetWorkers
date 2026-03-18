export interface Cliente {
  _id: string;
  nombre: string;
  apellido: string;
  telefono: string;
  email: string;
  direccion: string;
  descripcion?: string;
  es_prestador: boolean;
  tipo_servicio?: string;
  categoria?: string;
  subcategoria?: string;
  descripcion_servicio?: string;
  ubicacion_servicio?: string;
  direccion_servicio?: string;
  coste_hora?: number;
}

export interface RegistroClientePayload {
  nombre: string;
  apellido: string;
  telefono: string;
  email: string;
  ['contraseña']: string;
  direccion: string;
  descripcion?: string;
  es_prestador: boolean;
  tipo_servicio?: string;
  categoria?: string;
  subcategoria?: string;
  descripcion_servicio?: string;
  ubicacion_servicio?: string;
  direccion_servicio?: string;
  coste_hora?: number;
}

export interface LoginPayload {
  email: string;
  contrasena: string;
}

export interface AuthResponse {
  cliente: Cliente;
  token: string;
}
