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
const TrabajoSolicitudModel_1 = __importDefault(require("../modelos/TrabajoSolicitudModel"));
const ClienteModel_1 = __importDefault(require("../modelos/ClienteModel"));
const AvisoModel_1 = __importDefault(require("../modelos/AvisoModel"));
const JwtService_1 = __importDefault(require("../servicios/JwtService"));
const routerTrabajos = (0, express_1.Router)();
const TAMANO_MAXIMO_FOTOS_ESTIMADO = 10 * 1024 * 1024;
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
function normalizarTrabajoPayload(payload) {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o;
    const fotos = Array.isArray(payload.fotos)
        ? payload.fotos
            .filter((foto) => typeof foto === 'string')
            .map((foto) => foto.trim())
            .filter(Boolean)
        : [];
    const presupuestoValor = typeof payload.presupuesto === 'number'
        ? payload.presupuesto
        : Number((_a = payload.presupuesto) !== null && _a !== void 0 ? _a : 0);
    return {
        cliente_id: String((_b = payload.cliente_id) !== null && _b !== void 0 ? _b : '').trim(),
        cliente_nombre: String((_c = payload.cliente_nombre) !== null && _c !== void 0 ? _c : '').trim(),
        cliente_email: String((_d = payload.cliente_email) !== null && _d !== void 0 ? _d : '').trim().toLowerCase(),
        cliente_telefono: String((_e = payload.cliente_telefono) !== null && _e !== void 0 ? _e : '').trim(),
        titulo: String((_f = payload.titulo) !== null && _f !== void 0 ? _f : '').trim(),
        descripcion: String((_g = payload.descripcion) !== null && _g !== void 0 ? _g : '').trim(),
        categoria: String((_h = payload.categoria) !== null && _h !== void 0 ? _h : '').trim(),
        path_categoria: String((_j = payload.path_categoria) !== null && _j !== void 0 ? _j : '').trim(),
        subcategoria: String((_k = payload.subcategoria) !== null && _k !== void 0 ? _k : '').trim(),
        path_subcategoria: String((_l = payload.path_subcategoria) !== null && _l !== void 0 ? _l : '').trim(),
        ubicacion: String((_m = payload.ubicacion) !== null && _m !== void 0 ? _m : '').trim(),
        presupuesto: Number.isFinite(presupuestoValor) ? presupuestoValor : 0,
        fecha_limite: String((_o = payload.fecha_limite) !== null && _o !== void 0 ? _o : '').trim(),
        fotos,
        estado: 'publicado',
    };
}
function validarTrabajoSolicitado(trabajo) {
    if (!trabajo.cliente_nombre ||
        !trabajo.cliente_email ||
        !trabajo.cliente_telefono ||
        !trabajo.titulo ||
        !trabajo.descripcion ||
        !trabajo.categoria ||
        !trabajo.path_categoria ||
        !trabajo.subcategoria ||
        !trabajo.path_subcategoria ||
        !trabajo.ubicacion) {
        return 'Faltan datos obligatorios para publicar el trabajo';
    }
    const tamanoEstimadoFotos = Array.isArray(trabajo.fotos)
        ? trabajo.fotos.reduce((acumulado, foto) => acumulado + Math.ceil((foto.length * 3) / 4), 0)
        : 0;
    if (tamanoEstimadoFotos > TAMANO_MAXIMO_FOTOS_ESTIMADO) {
        return 'Las imágenes ocupan demasiado. Reduce el tamaño o sube menos fotos.';
    }
    return null;
}
function obtenerClienteAutorizado(idCliente) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        if (!mongoose_1.default.Types.ObjectId.isValid(idCliente)) {
            return null;
        }
        const cliente = yield ClienteModel_1.default.findById(idCliente, { email: 1 }).lean();
        if (!cliente) {
            return null;
        }
        return {
            _id: String(idCliente),
            email: String((_a = cliente.email) !== null && _a !== void 0 ? _a : '').trim().toLowerCase(),
        };
    });
}
function construirFiltroPropietarioTrabajo(idCliente, emailCliente) {
    const filtros = [{ cliente_id: idCliente }];
    if (emailCliente.trim() !== '') {
        filtros.push({ cliente_email: emailCliente });
    }
    return filtros;
}
function escaparRegex(valor) {
    return valor.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
function generarAvisosParaPrestadores(trabajo, trabajoId) {
    return __awaiter(this, void 0, void 0, function* () {
        const valoresBusqueda = [
            trabajo.path_subcategoria,
            trabajo.subcategoria,
            trabajo.path_categoria,
            trabajo.categoria,
        ].filter((valor) => typeof valor === 'string' && valor.trim() !== '');
        if (valoresBusqueda.length === 0) {
            return;
        }
        const filtrosPrestador = [];
        for (const valor of valoresBusqueda) {
            const valorLimpio = valor.trim();
            const regexValor = new RegExp(`^${escaparRegex(valorLimpio)}$`, 'i');
            filtrosPrestador.push({ categoria: valorLimpio }, { subcategoria: valorLimpio }, { tipo_servicio: valorLimpio }, { categoria: regexValor }, { subcategoria: regexValor }, { tipo_servicio: regexValor });
        }
        const prestadores = yield ClienteModel_1.default.find({
            es_prestador: true,
            $or: filtrosPrestador,
        }, { _id: 1 }).lean();
        if (prestadores.length === 0) {
            return;
        }
        const avisos = prestadores.map((prestador) => {
            var _a, _b, _c;
            return ({
                prestador_id: String(prestador._id),
                trabajo_id: trabajoId,
                trabajo_titulo: trabajo.titulo,
                trabajo_descripcion: trabajo.descripcion,
                categoria: trabajo.categoria,
                subcategoria: trabajo.subcategoria,
                ubicacion: trabajo.ubicacion,
                presupuesto: (_a = trabajo.presupuesto) !== null && _a !== void 0 ? _a : 0,
                fecha_limite: (_b = trabajo.fecha_limite) !== null && _b !== void 0 ? _b : '',
                foto_principal: (_c = trabajo.fotos[0]) !== null && _c !== void 0 ? _c : '',
                leido: false,
            });
        });
        yield AvisoModel_1.default.insertMany(avisos, { ordered: false });
    });
}
routerTrabajos.get('/', (_request, response) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const trabajos = yield TrabajoSolicitudModel_1.default.find().sort({ createdAt: -1 }).lean();
        response.status(200).json(trabajos);
    }
    catch (error) {
        console.error('Error obteniendo trabajos solicitados desde MongoDB:', error);
        response.status(500).json({ error: 'No se pudieron obtener los trabajos publicados' });
    }
}));
routerTrabajos.get('/mis-trabajos', (request, response) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const idCliente = obtenerIdClienteDesdeToken(request.headers.authorization);
        if (!idCliente || !mongoose_1.default.Types.ObjectId.isValid(idCliente)) {
            response.status(401).json({ error: 'Token inválido o ausente' });
            return;
        }
        const cliente = yield ClienteModel_1.default.findById(idCliente, { email: 1, trabajos_solicitados: 1 }).lean();
        if (!cliente) {
            response.status(404).json({ error: 'Cliente no encontrado' });
            return;
        }
        const trabajosSolicitadosIds = Array.isArray(cliente.trabajos_solicitados)
            ? cliente.trabajos_solicitados.filter((trabajoId) => typeof trabajoId === 'string' && mongoose_1.default.Types.ObjectId.isValid(trabajoId))
            : [];
        const filtrosBusqueda = [
            { cliente_id: idCliente },
            { cliente_email: String((_a = cliente.email) !== null && _a !== void 0 ? _a : '').trim().toLowerCase() },
        ];
        if (trabajosSolicitadosIds.length > 0) {
            filtrosBusqueda.push({ _id: { $in: trabajosSolicitadosIds } });
        }
        const trabajos = yield TrabajoSolicitudModel_1.default.find({
            $or: filtrosBusqueda,
        }).sort({ createdAt: -1 }).lean();
        response.status(200).json(trabajos);
    }
    catch (error) {
        console.error('Error obteniendo trabajos del cliente:', error);
        response.status(500).json({ error: 'No se pudieron obtener tus trabajos publicados' });
    }
}));
routerTrabajos.get('/:id', (request, response) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const idTrabajo = String((_a = request.params.id) !== null && _a !== void 0 ? _a : '').trim();
        const idCliente = obtenerIdClienteDesdeToken(request.headers.authorization);
        if (!idCliente || !mongoose_1.default.Types.ObjectId.isValid(idCliente)) {
            response.status(401).json({ error: 'Token inválido o ausente' });
            return;
        }
        if (!mongoose_1.default.Types.ObjectId.isValid(idTrabajo)) {
            response.status(400).json({ error: 'Identificador de trabajo inválido' });
            return;
        }
        const cliente = yield obtenerClienteAutorizado(idCliente);
        if (!cliente) {
            response.status(404).json({ error: 'Cliente no encontrado' });
            return;
        }
        const trabajo = yield TrabajoSolicitudModel_1.default.findOne({
            _id: idTrabajo,
            $or: construirFiltroPropietarioTrabajo(cliente._id, cliente.email),
        }).lean();
        if (!trabajo) {
            response.status(404).json({ error: 'Trabajo no encontrado' });
            return;
        }
        response.status(200).json(trabajo);
    }
    catch (error) {
        console.error('Error obteniendo trabajo solicitado:', error);
        response.status(500).json({ error: 'No se pudo obtener el trabajo solicitado' });
    }
}));
routerTrabajos.post('/', (request, response) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c;
    try {
        const idClienteDesdeToken = obtenerIdClienteDesdeToken(request.headers.authorization);
        const payload = request.body;
        const nuevoTrabajo = normalizarTrabajoPayload(payload);
        if (idClienteDesdeToken && mongoose_1.default.Types.ObjectId.isValid(idClienteDesdeToken)) {
            nuevoTrabajo.cliente_id = idClienteDesdeToken;
            const cliente = yield ClienteModel_1.default.findById(idClienteDesdeToken, { nombre: 1, email: 1, telefono: 1 }).lean();
            if (cliente) {
                nuevoTrabajo.cliente_nombre = String((_a = cliente.nombre) !== null && _a !== void 0 ? _a : nuevoTrabajo.cliente_nombre).trim();
                nuevoTrabajo.cliente_email = String((_b = cliente.email) !== null && _b !== void 0 ? _b : nuevoTrabajo.cliente_email).trim().toLowerCase();
                nuevoTrabajo.cliente_telefono = String((_c = cliente.telefono) !== null && _c !== void 0 ? _c : nuevoTrabajo.cliente_telefono).trim();
            }
        }
        const errorValidacion = validarTrabajoSolicitado(nuevoTrabajo);
        if (errorValidacion) {
            response.status(400).json({ error: errorValidacion });
            return;
        }
        const trabajoGuardado = yield TrabajoSolicitudModel_1.default.create(nuevoTrabajo);
        if (idClienteDesdeToken && mongoose_1.default.Types.ObjectId.isValid(idClienteDesdeToken)) {
            try {
                yield ClienteModel_1.default.updateOne({ _id: idClienteDesdeToken }, {
                    $addToSet: {
                        trabajos_solicitados: String(trabajoGuardado._id),
                    },
                });
            }
            catch (errorCliente) {
                console.error('El trabajo se publicó, pero no se pudo enlazar en el cliente:', errorCliente);
            }
        }
        try {
            yield generarAvisosParaPrestadores(nuevoTrabajo, String(trabajoGuardado._id));
        }
        catch (errorAvisos) {
            console.error('El trabajo se publicó, pero falló la generación de avisos:', errorAvisos);
        }
        response.status(201).json({
            mensaje: 'Trabajo publicado correctamente',
            trabajo: trabajoGuardado.toObject(),
        });
    }
    catch (error) {
        console.error('Error creando trabajo solicitado en MongoDB:', error);
        response.status(500).json({ error: 'No se pudo publicar el trabajo' });
    }
}));
routerTrabajos.put('/:id', (request, response) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d, _e, _f, _g, _h;
    try {
        const idTrabajo = String((_a = request.params.id) !== null && _a !== void 0 ? _a : '').trim();
        const idClienteDesdeToken = obtenerIdClienteDesdeToken(request.headers.authorization);
        if (!idClienteDesdeToken || !mongoose_1.default.Types.ObjectId.isValid(idClienteDesdeToken)) {
            response.status(401).json({ error: 'Token inválido o ausente' });
            return;
        }
        if (!mongoose_1.default.Types.ObjectId.isValid(idTrabajo)) {
            response.status(400).json({ error: 'Identificador de trabajo inválido' });
            return;
        }
        const cliente = yield obtenerClienteAutorizado(idClienteDesdeToken);
        if (!cliente) {
            response.status(404).json({ error: 'Cliente no encontrado' });
            return;
        }
        const trabajoExistente = yield TrabajoSolicitudModel_1.default.findOne({
            _id: idTrabajo,
            $or: construirFiltroPropietarioTrabajo(cliente._id, cliente.email),
        });
        if (!trabajoExistente) {
            response.status(404).json({ error: 'Trabajo no encontrado' });
            return;
        }
        const payload = request.body;
        const trabajoActualizado = normalizarTrabajoPayload(payload);
        trabajoActualizado.cliente_id = cliente._id;
        const nombreCliente = String((_c = (_b = payload.cliente_nombre) !== null && _b !== void 0 ? _b : trabajoExistente.cliente_nombre) !== null && _c !== void 0 ? _c : '').trim();
        const emailCliente = String((_f = (_e = (_d = payload.cliente_email) !== null && _d !== void 0 ? _d : cliente.email) !== null && _e !== void 0 ? _e : trabajoExistente.cliente_email) !== null && _f !== void 0 ? _f : '').trim().toLowerCase();
        const telefonoCliente = String((_h = (_g = payload.cliente_telefono) !== null && _g !== void 0 ? _g : trabajoExistente.cliente_telefono) !== null && _h !== void 0 ? _h : '').trim();
        trabajoActualizado.cliente_nombre = nombreCliente || trabajoExistente.cliente_nombre;
        trabajoActualizado.cliente_email = emailCliente || trabajoExistente.cliente_email;
        trabajoActualizado.cliente_telefono = telefonoCliente || trabajoExistente.cliente_telefono;
        const errorValidacion = validarTrabajoSolicitado(trabajoActualizado);
        if (errorValidacion) {
            response.status(400).json({ error: errorValidacion });
            return;
        }
        const trabajoGuardado = yield TrabajoSolicitudModel_1.default.findByIdAndUpdate(idTrabajo, {
            $set: trabajoActualizado,
        }, { new: true }).lean();
        if (!trabajoGuardado) {
            response.status(404).json({ error: 'Trabajo no encontrado' });
            return;
        }
        yield AvisoModel_1.default.deleteMany({ trabajo_id: idTrabajo });
        try {
            yield generarAvisosParaPrestadores(trabajoGuardado, idTrabajo);
        }
        catch (errorAvisos) {
            console.error('El trabajo se actualizó, pero falló la regeneración de avisos:', errorAvisos);
        }
        response.status(200).json({
            mensaje: 'Trabajo actualizado correctamente',
            trabajo: trabajoGuardado,
        });
    }
    catch (error) {
        console.error('Error actualizando trabajo solicitado:', error);
        response.status(500).json({ error: 'No se pudo actualizar el trabajo' });
    }
}));
routerTrabajos.delete('/:id', (request, response) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const idTrabajo = String((_a = request.params.id) !== null && _a !== void 0 ? _a : '').trim();
        const idClienteDesdeToken = obtenerIdClienteDesdeToken(request.headers.authorization);
        if (!idClienteDesdeToken || !mongoose_1.default.Types.ObjectId.isValid(idClienteDesdeToken)) {
            response.status(401).json({ error: 'Token inválido o ausente' });
            return;
        }
        if (!mongoose_1.default.Types.ObjectId.isValid(idTrabajo)) {
            response.status(400).json({ error: 'Identificador de trabajo inválido' });
            return;
        }
        const cliente = yield obtenerClienteAutorizado(idClienteDesdeToken);
        if (!cliente) {
            response.status(404).json({ error: 'Cliente no encontrado' });
            return;
        }
        const trabajoEliminable = yield TrabajoSolicitudModel_1.default.findOneAndDelete({
            _id: idTrabajo,
            $or: construirFiltroPropietarioTrabajo(cliente._id, cliente.email),
        }).lean();
        if (!trabajoEliminable) {
            response.status(404).json({ error: 'Trabajo no encontrado' });
            return;
        }
        yield ClienteModel_1.default.updateOne({ _id: idClienteDesdeToken }, { $pull: { trabajos_solicitados: idTrabajo } });
        yield AvisoModel_1.default.deleteMany({ trabajo_id: idTrabajo });
        response.status(200).json({
            mensaje: 'Trabajo eliminado correctamente',
        });
    }
    catch (error) {
        console.error('Error eliminando trabajo solicitado:', error);
        response.status(500).json({ error: 'No se pudo eliminar el trabajo' });
    }
}));
exports.default = routerTrabajos;
//# sourceMappingURL=endpointsTrabajos.js.map