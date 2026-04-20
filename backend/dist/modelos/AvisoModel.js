"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importStar(require("mongoose"));
const avisoSchema = new mongoose_1.Schema({
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
}, {
    collection: 'avisos_prestadores',
    versionKey: false,
    timestamps: true,
});
// Índices condicionales que solo aplican para trabajos y reservas
avisoSchema.index({ prestador_id: 1, trabajo_id: 1 }, {
    unique: true,
    partialFilterExpression: { tipo: 'trabajo', trabajo_id: { $exists: true, $ne: null } }
});
avisoSchema.index({ prestador_id: 1, reserva_id: 1 }, {
    unique: true,
    partialFilterExpression: { tipo: 'reserva', reserva_id: { $exists: true, $ne: null } }
});
avisoSchema.index({ prestador_id: 1, tipo: 1 });
const AvisoModel = mongoose_1.default.model('Aviso', avisoSchema);
exports.default = AvisoModel;
//# sourceMappingURL=AvisoModel.js.map