import mongoose, { Schema } from 'mongoose';

export type TrabajoSolicitudDocument = {
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
  fotos: string[];
  estado: string;
};

const trabajoSolicitudSchema = new Schema<TrabajoSolicitudDocument>(
  {
    cliente_id: { type: String, default: '' },
    cliente_nombre: { type: String, required: true, trim: true },
    cliente_email: { type: String, required: true, lowercase: true, trim: true },
    cliente_telefono: { type: String, required: true, trim: true },
    titulo: { type: String, required: true, trim: true },
    descripcion: { type: String, required: true, trim: true },
    categoria: { type: String, required: true, trim: true },
    path_categoria: { type: String, required: true, trim: true },
    subcategoria: { type: String, required: true, trim: true },
    path_subcategoria: { type: String, required: true, trim: true },
    ubicacion: { type: String, required: true, trim: true },
    presupuesto: { type: Number, default: 0 },
    fecha_limite: { type: String, default: '' },
    fotos: { type: [String], default: [] },
    estado: { type: String, default: 'publicado' },
  },
  {
    collection: 'trabajos_solicitados',
    versionKey: false,
    timestamps: true,
  }
);

const TrabajoSolicitudModel = mongoose.model<TrabajoSolicitudDocument>('TrabajoSolicitud', trabajoSolicitudSchema);

export default TrabajoSolicitudModel;