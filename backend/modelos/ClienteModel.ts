import mongoose, { Schema } from 'mongoose';

export type ClienteDocument = {
  nombre: string;
  apellido: string;
  telefono: string;
  email: string;
  contrasena: string;
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
  trabajos_solicitados?: string[];
};

const clienteSchema = new Schema<ClienteDocument>(
  {
    nombre: { type: String, required: true, trim: true },
    apellido: { type: String, required: true, trim: true },
    telefono: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    contrasena: { type: String, required: true },
    direccion: { type: String, required: true, trim: true },
    descripcion: { type: String, default: '' },
    es_prestador: { type: Boolean, default: false },
    tipo_servicio: { type: String, default: '' },
    categoria: { type: String, default: '' },
    subcategoria: { type: String, default: '' },
    descripcion_servicio: { type: String, default: '' },
    ubicacion_servicio: { type: String, default: '' },
    direccion_servicio: { type: String, default: '' },
    coste_hora: { type: Number, default: 0 },
    trabajos_solicitados: { type: [String], default: [] },
  },
  {
    collection: 'clientes',
    versionKey: false,
  }
);

const ClienteModel = mongoose.model<ClienteDocument>('Cliente', clienteSchema);

export default ClienteModel;
