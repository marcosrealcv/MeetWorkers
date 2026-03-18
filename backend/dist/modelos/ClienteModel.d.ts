import mongoose from 'mongoose';
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
};
declare const ClienteModel: mongoose.Model<ClienteDocument, {}, {}, {}, mongoose.Document<unknown, {}, ClienteDocument, {}, mongoose.DefaultSchemaOptions> & ClienteDocument & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
} & {
    id: string;
}, any, ClienteDocument>;
export default ClienteModel;
//# sourceMappingURL=ClienteModel.d.ts.map