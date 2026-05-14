export interface Proveedor {
  id: string;
  nombre: string;
  especialidad: string;
  rating: number;
  resenas: number;
  precio: string;
  imagen: string;
  experiencia: string;
  resenasDetalladas?: Array<{
    _id?: string;
    cliente_nombre: string;
    resena_calificacion?: number;
    resena_comentario?: string;
    resena_fecha?: string;
    trabajo_titulo: string;
  }>;
}
