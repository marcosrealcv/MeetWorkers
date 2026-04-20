import mongoose from 'mongoose';
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
    cliente_id?: string;
    cliente_nombre?: string;
    cliente_email?: string;
    cliente_telefono?: string;
    fecha_reserva?: string;
    hora_reserva?: string;
    estado_reserva?: 'pendiente' | 'aceptado' | 'rechazado';
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