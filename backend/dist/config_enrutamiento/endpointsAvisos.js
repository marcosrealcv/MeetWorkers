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
const express_1 = require("express");
const mongoose_1 = __importDefault(require("mongoose"));
const AvisoModel_1 = __importDefault(require("../modelos/AvisoModel"));
const ClienteModel_1 = __importDefault(require("../modelos/ClienteModel"));
const JwtService_1 = __importDefault(require("../servicios/JwtService"));
const routerAvisos = (0, express_1.Router)();
function extraerTokenBearer(authorizationHeader) {
    if (!(authorizationHeader === null || authorizationHeader === void 0 ? void 0 : authorizationHeader.startsWith('Bearer '))) {
        return null;
    }
    return authorizationHeader.slice('Bearer '.length);
}
function obtenerIdClienteDesdeToken(authorizationHeader) {
    const token = extraerTokenBearer(authorizationHeader);
    if (!token) {
        return null;
    }
    const { valid, payload } = JwtService_1.default.verificarJWT(token);
    if (!valid || !payload || typeof payload !== 'object') {
        return null;
    }
    if (typeof payload.sub === 'string' && payload.sub.trim() !== '') {
        return payload.sub;
    }
    if (typeof payload.idCliente === 'string' && payload.idCliente.trim() !== '') {
        return payload.idCliente;
    }
    return null;
}
routerAvisos.get('/mis-avisos', (request, response) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const idCliente = obtenerIdClienteDesdeToken(request.headers.authorization);
        if (!idCliente || !mongoose_1.default.Types.ObjectId.isValid(idCliente)) {
            response.status(401).json({ error: 'Token inválido o ausente' });
            return;
        }
        const cliente = yield ClienteModel_1.default.findById(idCliente, { es_prestador: 1 }).lean();
        if (!cliente) {
            response.status(404).json({ error: 'Cliente no encontrado' });
            return;
        }
        if (!cliente.es_prestador) {
            response.status(200).json([]);
            return;
        }
        const avisos = yield AvisoModel_1.default.find({ prestador_id: idCliente })
            .sort({ leido: 1, createdAt: -1 })
            .lean();
        response.status(200).json(avisos);
    }
    catch (error) {
        console.error('Error obteniendo avisos del prestador:', error);
        response.status(500).json({ error: 'No se pudieron obtener los avisos' });
    }
}));
routerAvisos.put('/:id/leido', (request, response) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const idCliente = obtenerIdClienteDesdeToken(request.headers.authorization);
        const idAviso = String((_a = request.params.id) !== null && _a !== void 0 ? _a : '').trim();
        if (!idCliente || !mongoose_1.default.Types.ObjectId.isValid(idCliente)) {
            response.status(401).json({ error: 'Token inválido o ausente' });
            return;
        }
        if (!idAviso || !mongoose_1.default.Types.ObjectId.isValid(idAviso)) {
            response.status(400).json({ error: 'Identificador de aviso inválido' });
            return;
        }
        const avisoActualizado = yield AvisoModel_1.default.findOneAndUpdate({ _id: idAviso, prestador_id: idCliente }, { $set: { leido: true } }, { new: true }).lean();
        if (!avisoActualizado) {
            response.status(404).json({ error: 'Aviso no encontrado' });
            return;
        }
        response.status(200).json(avisoActualizado);
    }
    catch (error) {
        console.error('Error marcando aviso como leído:', error);
        response.status(500).json({ error: 'No se pudo actualizar el aviso' });
    }
}));
routerAvisos.delete('/:id', (request, response) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const idCliente = obtenerIdClienteDesdeToken(request.headers.authorization);
        const idAviso = String((_a = request.params.id) !== null && _a !== void 0 ? _a : '').trim();
        if (!idCliente || !mongoose_1.default.Types.ObjectId.isValid(idCliente)) {
            response.status(401).json({ error: 'Token inválido o ausente' });
            return;
        }
        if (!idAviso || !mongoose_1.default.Types.ObjectId.isValid(idAviso)) {
            response.status(400).json({ error: 'Identificador de aviso inválido' });
            return;
        }
        const cliente = yield ClienteModel_1.default.findById(idCliente, { es_prestador: 1 }).lean();
        if (!cliente) {
            response.status(404).json({ error: 'Cliente no encontrado' });
            return;
        }
        if (!cliente.es_prestador) {
            response.status(403).json({ error: 'Solo un prestador puede eliminar avisos' });
            return;
        }
        const resultadoEliminacion = yield AvisoModel_1.default.deleteOne({
            _id: idAviso,
            prestador_id: idCliente,
        });
        if (!resultadoEliminacion.deletedCount) {
            response.status(404).json({ error: 'Aviso no encontrado' });
            return;
        }
        response.status(200).json({ mensaje: 'Aviso eliminado correctamente' });
    }
    catch (error) {
        console.error('Error eliminando aviso del prestador:', error);
        response.status(500).json({ error: 'No se pudo eliminar el aviso' });
    }
}));
exports.default = routerAvisos;
//# sourceMappingURL=endpointsAvisos.js.map