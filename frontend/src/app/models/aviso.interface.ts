export interface AvisoPrestador {
  _id: string;
  prestador_id: string;
  trabajo_id: string;
  trabajo_titulo: string;
  trabajo_descripcion: string;
  categoria: string;
  subcategoria: string;
  ubicacion: string;
  presupuesto?: number;
  fecha_limite?: string;
  foto_principal?: string;
  leido: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface EliminarAvisoResponse {
  mensaje: string;
}