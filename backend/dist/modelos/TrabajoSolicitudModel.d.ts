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
    prestador_aceptado_id?: string;
    prestador_aceptado_nombre?: string;
    fecha_aceptacion?: string;
    cancelado_por_id?: string;
    cancelado_por_nombre?: string;
    fecha_cancelacion?: string;
    motivo_cancelacion?: string;
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