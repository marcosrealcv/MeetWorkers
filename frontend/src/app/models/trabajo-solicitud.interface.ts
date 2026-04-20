export interface TrabajoSolicitud {
  _id: string;
  cliente_id?: string;
  cliente_nombre: string;
  cliente_email: string;
  cliente_telefono: string;
  titulo: string;
  descripcion: string;
  categoria: string;
  path_categoria: string;
  subcategoria: string;
  path_subcategoria: string;
  ubicacion: string;
  presupuesto: number;
  fecha_limite?: string;
  fotos: string[];
  estado: string;
  prestador_aceptado_id?: string;
  prestador_aceptado_nombre?: string;
  fecha_aceptacion?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface NuevoTrabajoSolicitudPayload {
  cliente_id?: string;
  cliente_nombre: string;
  cliente_email: string;
  cliente_telefono: string;
  titulo: string;
  descripcion: string;
  categoria: string;
  path_categoria: string;
  subcategoria: string;
  path_subcategoria: string;
  ubicacion: string;
  presupuesto?: number;
  fecha_limite?: string;
  fotos?: string[];
}

export interface PublicarTrabajoResponse {
  mensaje: string;
  trabajo: TrabajoSolicitud;
}

export interface EliminarTrabajoResponse {
  mensaje: string;
}