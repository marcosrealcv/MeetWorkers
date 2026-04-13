import mongoose, { Schema } from 'mongoose';

export type AvisoDocument = {
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
};

const avisoSchema = new Schema<AvisoDocument>(
  {
    prestador_id: { type: String, required: true, trim: true, index: true },
    trabajo_id: { type: String, required: true, trim: true, index: true },
    trabajo_titulo: { type: String, required: true, trim: true },
    trabajo_descripcion: { type: String, required: true, trim: true },
    categoria: { type: String, required: true, trim: true },
    subcategoria: { type: String, required: true, trim: true },
    ubicacion: { type: String, required: true, trim: true },
    presupuesto: { type: Number, default: 0 },
    fecha_limite: { type: String, default: '' },
    foto_principal: { type: String, default: '' },
    leido: { type: Boolean, default: false },
  },
  {
    collection: 'avisos_prestadores',
    versionKey: false,
    timestamps: true,
  }
);

avisoSchema.index({ prestador_id: 1, trabajo_id: 1 }, { unique: true });

const AvisoModel = mongoose.model<AvisoDocument>('Aviso', avisoSchema);

export default AvisoModel;