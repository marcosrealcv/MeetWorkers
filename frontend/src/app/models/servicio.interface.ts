import { TrabajoSolicitud } from './trabajo-solicitud.interface';

export interface Servicio {
  id: number;
  nombre: string;
  descripcion: string;
  precio: string;
  categoria: string;
  pathCategoria: string;
  imagen: string;
  rating: number;
  trabajoId?: string;
  detalleTrabajo?: TrabajoSolicitud;
  estadoTrabajo?: string;
  prestadorAceptadoNombre?: string;
}