import mongoose from 'mongoose';
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
declare const TrabajoSolicitudModel: mongoose.Model<TrabajoSolicitudDocument, {}, {}, {}, mongoose.Document<unknown, {}, TrabajoSolicitudDocument, {}, mongoose.DefaultSchemaOptions> & TrabajoSolicitudDocument & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
} & {
    id: string;
}, any, TrabajoSolicitudDocument>;
export default TrabajoSolicitudModel;
//# sourceMappingURL=TrabajoSolicitudModel.d.ts.map