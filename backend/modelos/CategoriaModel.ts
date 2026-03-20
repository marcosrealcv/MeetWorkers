import mongoose, { Schema } from 'mongoose';

export type CategoriaDocument = {
  nombreCategoria: string;
  pathCategoria: string;
};

const categoriaSchema = new Schema<CategoriaDocument>(
  {
    nombreCategoria: { type: String, required: true },
    pathCategoria: { type: String, required: true },
  },
  {
    collection: 'categorias',
    versionKey: false,
  }
);

const CategoriaModel = mongoose.model<CategoriaDocument>('Categoria', categoriaSchema);

export default CategoriaModel;
