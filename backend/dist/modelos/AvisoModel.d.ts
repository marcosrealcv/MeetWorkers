import mongoose from 'mongoose';
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
declare const AvisoModel: mongoose.Model<AvisoDocument, {}, {}, {}, mongoose.Document<unknown, {}, AvisoDocument, {}, mongoose.DefaultSchemaOptions> & AvisoDocument & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
} & {
    id: string;
}, any, AvisoDocument>;
export default AvisoModel;
//# sourceMappingURL=AvisoModel.d.ts.map