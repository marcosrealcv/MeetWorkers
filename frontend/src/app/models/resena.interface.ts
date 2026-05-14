export interface Resena {
  _id?: string;
  reserva_id: string;
  cliente_id: string;
  calificacion: number; // 1-5
  comentario: string;
  fecha_resena?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CrearResenaPayload {
  calificacion: number;
  comentario: string;
}
