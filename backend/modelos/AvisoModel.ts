import mongoose, { Schema } from 'mongoose';

export type AvisoDocument = {
  prestador_id: string;
  tipo: 'trabajo' | 'reserva';
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
  // Campos específicos para reservas
  cliente_id?: string;
  cliente_nombre?: string;
  cliente_email?: string;
  cliente_telefono?: string;
  fecha_reserva?: string;
  hora_reserva?: string;
  estado_reserva?: 'pendiente' | 'aceptado' | 'rechazado';
  leido: boolean;
};

const avisoSchema = new Schema<AvisoDocument>(
  {
    prestador_id: { type: String, required: true, trim: true, index: true },
    tipo: { type: String, enum: ['trabajo', 'reserva'], default: 'trabajo' },
    trabajo_id: { type: String, trim: true, index: true, sparse: true },
    reserva_id: { type: String, trim: true, index: true, sparse: true },
    trabajo_titulo: { type: String, required: true, trim: true },
    trabajo_descripcion: { type: String, required: true, trim: true },
    categoria: { type: String, required: true, trim: true },
    subcategoria: { type: String, required: true, trim: true },
    ubicacion: { type: String, required: true, trim: true },
    presupuesto: { type: Number, default: 0 },
    fecha_limite: { type: String, default: '' },
    foto_principal: { type: String, default: '' },
    cliente_id: { type: String, trim: true, sparse: true },
    cliente_nombre: { type: String, trim: true, default: '' },
    cliente_email: { type: String, trim: true, lowercase: true, sparse: true },
    cliente_telefono: { type: String, trim: true, default: '' },
    fecha_reserva: { type: String, default: '' },
    hora_reserva: { type: String, default: '' },
    estado_reserva: { type: String, enum: ['pendiente', 'aceptado', 'rechazado'], default: 'pendiente', sparse: true },
    leido: { type: Boolean, default: false },
  },
  {
    collection: 'avisos_prestadores',
    versionKey: false,
    timestamps: true,
  }
);

// Índices condicionales que solo aplican para trabajos y reservas
avisoSchema.index(
  { prestador_id: 1, trabajo_id: 1 },
  {
    unique: true,
    partialFilterExpression: { tipo: 'trabajo', trabajo_id: { $exists: true, $ne: null } }
  }
);

avisoSchema.index(
  { prestador_id: 1, reserva_id: 1 },
  {
    unique: true,
    partialFilterExpression: { tipo: 'reserva', reserva_id: { $exists: true, $ne: null } }
  }
);

avisoSchema.index({ prestador_id: 1, tipo: 1 });

const AvisoModel = mongoose.model<AvisoDocument>('Aviso', avisoSchema);

export default AvisoModel;