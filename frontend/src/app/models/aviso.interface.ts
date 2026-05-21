export interface AvisoPrestador {
  _id: string;
  prestador_id: string;
  cliente_id?: string;
  tipo?: 'trabajo' | 'reserva' | 'reserva_rechazada' | 'solicitud_rechazada';
  trabajo_id?: string;
  reserva_id?: string;
  trabajo_titulo: string;
  trabajo_descripcion: string;
  categoria: string;
  subcategoria: string;
  ubicacion: string;
  presupuesto?: number;
  fecha_limite?: string;
  foto_principal?: string;
  fecha_reserva?: string;
  hora_reserva?: string;
  estado_reserva?: 'pendiente' | 'aceptado' | 'rechazado';
  leido: boolean;
  cancel_motivo?: string;
  createdAt: string;
  updatedAt: string;
}

export interface EliminarAvisoResponse {
  mensaje: string;
}