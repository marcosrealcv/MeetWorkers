"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.inicializarIndices = inicializarIndices;
const mongoose_1 = __importDefault(require("mongoose"));
function inicializarIndices() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const db = mongoose_1.default.connection;
            const collection = db.collection('avisos_prestadores');
            // Obtener índices actuales
            const indices = yield collection.listIndexes().toArray();
            const nombresIndices = indices.map((idx) => idx.name);
            console.log('🔍 Verificando índices en avisos_prestadores...');
            // Eliminar índices antiguos problemáticos
            const indicesAEliminar = [
                'prestador_id_1_trabajo_id_1',
                'prestador_id_1_reserva_id_1'
            ];
            for (const nombreIndice of indicesAEliminar) {
                if (nombresIndices.includes(nombreIndice)) {
                    try {
                        yield collection.dropIndex(nombreIndice);
                        console.log(`   ✓ Índice eliminado: ${nombreIndice}`);
                    }
                    catch (err) {
                        console.log(`   ⚠️  No se pudo eliminar ${nombreIndice}`);
                    }
                }
            }
            // Limpiar documentos duplicados con prestador_id "1" que no sean válidos
            const resultado = yield collection.deleteMany({
                prestador_id: '1',
                $and: [
                    {
                        $or: [
                            { tipo: 'trabajo', trabajo_id: { $in: [null, undefined] } },
                            { tipo: 'reserva', reserva_id: { $in: [null, undefined] } }
                        ]
                    }
                ]
            });
            if (resultado.deletedCount > 0) {
                console.log(`   ✓ ${resultado.deletedCount} documentos duplicados eliminados`);
            }
            console.log('✅ Índices verificados y limpiados correctamente\n');
        }
        catch (error) {
            console.error('⚠️  Error al inicializar índices:', error instanceof Error ? error.message : error);
            // No fallar el servidor si hay un error secundario
        }
    });
}
//# sourceMappingURL=inicializarIndices.js.map