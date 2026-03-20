import mongoose from 'mongoose';
export type CategoriaDocument = {
    nombreCategoria: string;
    pathCategoria: string;
};
declare const CategoriaModel: mongoose.Model<CategoriaDocument, {}, {}, {}, mongoose.Document<unknown, {}, CategoriaDocument, {}, mongoose.DefaultSchemaOptions> & CategoriaDocument & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
} & {
    id: string;
}, any, CategoriaDocument>;
export default CategoriaModel;
//# sourceMappingURL=CategoriaModel.d.ts.map