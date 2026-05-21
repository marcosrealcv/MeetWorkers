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
const routerReservas = (0, express_1.Router)();
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
function generarAvisoReserva(prestadorId, reserva) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const avisoReserva = Object.assign(Object.assign({}, reserva), { tipo: 'reserva', prestador_id: prestadorId, leido: false });
            const aviso = yield AvisoModel_1.default.create(avisoReserva);
            return !!aviso;
        }
        catch (error) {
            console.error('Error generando aviso de reserva:', error);
            return false;
        }
    });
}
// GET /reservas - Obtener todas las reservas del prestador autenticado
routerReservas.get('/', (request, response) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const idPrestador = obtenerIdClienteDesdeToken(request.headers.authorization);
        if (!idPrestador || !mongoose_1.default.Types.ObjectId.isValid(idPrestador)) {
            response.status(401).json({ error: 'Token inválido o ausente' });
            return;
        }
        const avisos = yield AvisoModel_1.default.find({
            prestador_id: idPrestador,
            tipo: 'reserva',
        })
            .sort({ createdAt: -1 })
            .lean();
        response.status(200).json(avisos);
    }
    catch (error) {
        console.error('Error obteniendo reservas:', error);
        response.status(500).json({ error: 'No se pudieron obtener las reservas' });
    }
}));
// GET /reservas/pendientes - Obtener reservas pendientes del prestador
routerReservas.get('/pendientes', (request, response) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const idPrestador = obtenerIdClienteDesdeToken(request.headers.authorization);
        if (!idPrestador || !mongoose_1.default.Types.ObjectId.isValid(idPrestador)) {
            response.status(401).json({ error: 'Token inválido o ausente' });
            return;
        }
        const avisos = yield AvisoModel_1.default.find({
            prestador_id: idPrestador,
            tipo: 'reserva',
            estado_reserva: 'pendiente',
        })
            .sort({ createdAt: -1 })
            .lean();
        response.status(200).json(avisos);
    }
    catch (error) {
        console.error('Error obteniendo reservas pendientes:', error);
        response.status(500).json({ error: 'No se pudieron obtener las reservas pendientes' });
    }
}));
// GET /reservas/mias - Obtener reservas hechas por el cliente autenticado
routerReservas.get('/mias', (request, response) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const idCliente = obtenerIdClienteDesdeToken(request.headers.authorization);
        if (!idCliente || !mongoose_1.default.Types.ObjectId.isValid(idCliente)) {
            response.status(401).json({ error: 'Token invalido o ausente' });
            return;
        }
        const cliente = yield ClienteModel_1.default.findById(idCliente).select({ email: 1 }).lean();
        const emailCliente = typeof (cliente === null || cliente === void 0 ? void 0 : cliente.email) === 'string'
            ? cliente.email.toLowerCase().trim()
            : '';
        const filtroReservas = emailCliente
            ? {
                tipo: 'reserva',
                $or: [
                    { cliente_id: idCliente },
                    { cliente_email: emailCliente },
                ],
            }
            : {
                tipo: 'reserva',
                cliente_id: idCliente,
            };
        console.log('[GET /api/reservas/mias] idCliente:', idCliente);
        console.log('[GET /api/reservas/mias] emailCliente:', emailCliente);
        console.log('[GET /api/reservas/mias] filtroReservas:', JSON.stringify(filtroReservas));
        const avisos = yield AvisoModel_1.default.find(filtroReservas)
            .sort({ createdAt: -1 })
            .lean();
        console.log('[GET /api/reservas/mias] found:', avisos.length);
        response.status(200).json(avisos);
    }
    catch (error) {
        console.error('Error obteniendo mis reservas:', error);
        response.status(500).json({ error: 'No se pudieron obtener tus reservas' });
    }
}));
// POST /reservas - Crear una nueva reserva
routerReservas.post('/', (request, response) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const idCliente = obtenerIdClienteDesdeToken(request.headers.authorization);
        const payload = request.body;
        // Validaciones básicas
        if (!payload.prestador_id || payload.prestador_id.trim() === '') {
            response.status(400).json({ error: 'ID del prestador inválido' });
            return;
        }
        if (!payload.cliente_nombre || !payload.cliente_email || !payload.cliente_telefono) {
            response.status(400).json({ error: 'Faltan datos del cliente' });
            return;
        }
        if (!payload.trabajo_titulo || !payload.trabajo_descripcion) {
            response.status(400).json({ error: 'Faltan datos del trabajo' });
            return;
        }
        if (!payload.fecha_reserva || !payload.hora_reserva) {
            response.status(400).json({ error: 'Faltan fecha y hora de la reserva' });
            return;
        }
        // Generar ID único para la reserva
        const reservaId = new mongoose_1.default.Types.ObjectId().toString();
        // Crear el aviso de reserva
        const avisoReserva = {
            prestador_id: String(payload.prestador_id).trim(),
            tipo: 'reserva',
            reserva_id: reservaId,
            trabajo_titulo: payload.trabajo_titulo,
            trabajo_descripcion: `${payload.trabajo_descripcion}\n\nCliente: ${payload.cliente_nombre}\nTeléfono: ${payload.cliente_telefono}`,
            categoria: payload.categoria,
            subcategoria: payload.subcategoria,
            ubicacion: payload.ubicacion,
            presupuesto: payload.presupuesto || 0,
            cliente_id: idCliente || '',
            cliente_nombre: payload.cliente_nombre,
            cliente_email: String(payload.cliente_email).toLowerCase().trim(),
            cliente_telefono: String(payload.cliente_telefono).trim(),
            fecha_reserva: String(payload.fecha_reserva).trim(),
            hora_reserva: String(payload.hora_reserva).trim(),
            estado_reserva: 'pendiente',
            leido: false,
        };
        const avisoGuardado = yield AvisoModel_1.default.create(avisoReserva);
        response.status(201).json({
            mensaje: 'Reserva creada correctamente. El prestador será notificado.',
            reserva: avisoGuardado.toObject(),
        });
    }
    catch (error) {
        console.error('Error creando reserva:', error);
        response.status(500).json({ error: 'No se pudo crear la reserva' });
    }
}));
// PUT /reservas/:id - Actualizar estado de reserva (aceptar/rechazar)
routerReservas.put('/:id', (request, response) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const idUsuario = obtenerIdClienteDesdeToken(request.headers.authorization);
        const avisoId = String((_a = request.params.id) !== null && _a !== void 0 ? _a : '').trim();
        const { estado_reserva } = request.body;
        if (!idUsuario || !mongoose_1.default.Types.ObjectId.isValid(idUsuario)) {
            response.status(401).json({ error: 'Token inválido o ausente' });
            return;
        }
        if (!mongoose_1.default.Types.ObjectId.isValid(avisoId)) {
            response.status(400).json({ error: 'ID de reserva inválido' });
            return;
        }
        if (!['aceptado', 'rechazado', 'pendiente'].includes(estado_reserva || '')) {
            response.status(400).json({ error: 'Estado de reserva inválido' });
            return;
        }
        // Buscar la reserva - puede ser prestador o cliente
        const avisoActual = yield AvisoModel_1.default.findOne({
            _id: avisoId,
            tipo: 'reserva',
            $or: [
                { prestador_id: idUsuario }, // Usuario es prestador
                { cliente_id: idUsuario }, // Usuario es cliente (solicitante)
            ],
        }).lean();
        if (!avisoActual) {
            response.status(404).json({ error: 'Reserva no encontrada' });
            return;
        }
        // Determinar quién es el usuario (prestador o cliente)
        const esPrestador = avisoActual.prestador_id === idUsuario;
        const esCliente = avisoActual.cliente_id === idUsuario;
        // Actualizar el estado de la reserva
        const avisoActualizado = yield AvisoModel_1.default.findOneAndUpdate({ _id: avisoId }, { $set: { estado_reserva } }, { new: true }).lean();
        // Si el estado es 'rechazado', crear un aviso para la otra parte
        if (estado_reserva === 'rechazado') {
            try {
                if (esPrestador && avisoActual.cliente_id) {
                    // Prestador rechaza: crear aviso para cliente
                    const avisoCliente = {
                        cliente_id: avisoActual.cliente_id,
                        prestador_id: idUsuario,
                        tipo: 'reserva_rechazada',
                        reserva_id: avisoId,
                        trabajo_titulo: avisoActual.trabajo_titulo,
                        trabajo_descripcion: avisoActual.trabajo_descripcion,
                        categoria: avisoActual.categoria,
                        subcategoria: avisoActual.subcategoria,
                        ubicacion: avisoActual.ubicacion,
                        presupuesto: avisoActual.presupuesto || 0,
                        fecha_reserva: avisoActual.fecha_reserva || '',
                        hora_reserva: avisoActual.hora_reserva || '',
                        leido: false,
                    };
                    yield AvisoModel_1.default.create(avisoCliente);
                }
                else if (esCliente && avisoActual.prestador_id) {
                    // Cliente rechaza: crear aviso para prestador
                    const avisoPrestador = {
                        prestador_id: avisoActual.prestador_id,
                        cliente_id: idUsuario,
                        tipo: 'solicitud_rechazada',
                        reserva_id: avisoId,
                        trabajo_titulo: avisoActual.trabajo_titulo,
                        trabajo_descripcion: avisoActual.trabajo_descripcion,
                        categoria: avisoActual.categoria,
                        subcategoria: avisoActual.subcategoria,
                        ubicacion: avisoActual.ubicacion,
                        presupuesto: avisoActual.presupuesto || 0,
                        fecha_reserva: avisoActual.fecha_reserva || '',
                        hora_reserva: avisoActual.hora_reserva || '',
                        leido: false,
                    };
                    yield AvisoModel_1.default.create(avisoPrestador);
                }
            }
            catch (error) {
                console.error('Error creando aviso de rechazo:', error);
                // No fallar la operación si el aviso no se crea
            }
        }
        response.status(200).json({
            mensaje: `Reserva ${estado_reserva} correctamente`,
            reserva: avisoActualizado,
        });
    }
    catch (error) {
        console.error('Error actualizando reserva:', error);
        response.status(500).json({ error: 'No se pudo actualizar la reserva' });
    }
}));
// PUT /reservas/:id/cancelar - Cliente cancela una reserva aceptada con motivo
routerReservas.put('/:id/cancelar', (request, response) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const idCliente = obtenerIdClienteDesdeToken(request.headers.authorization);
        const avisoId = String((_a = request.params.id) !== null && _a !== void 0 ? _a : '').trim();
        const { motivo } = request.body;
        if (!idCliente || !mongoose_1.default.Types.ObjectId.isValid(idCliente)) {
            response.status(401).json({ error: 'Token inválido o ausente' });
            return;
        }
        if (!mongoose_1.default.Types.ObjectId.isValid(avisoId)) {
            response.status(400).json({ error: 'ID de reserva inválido' });
            return;
        }
        // Buscar la reserva y validar que el solicitante sea el cliente y que esté aceptada
        const avisoActual = yield AvisoModel_1.default.findOne({ _id: avisoId, tipo: 'reserva' }).lean();
        if (!avisoActual) {
            response.status(404).json({ error: 'Reserva no encontrada' });
            return;
        }
        // Comprobar que el solicitante es el cliente que creó la reserva (o coincide email)
        const cliente = yield ClienteModel_1.default.findById(idCliente).select({ email: 1 }).lean();
        const emailCliente = typeof (cliente === null || cliente === void 0 ? void 0 : cliente.email) === 'string' ? cliente.email.toLowerCase().trim() : '';
        const esSolicitante = avisoActual.cliente_id === idCliente || (emailCliente && avisoActual.cliente_email === emailCliente);
        if (!esSolicitante) {
            response.status(403).json({ error: 'No tienes permiso para cancelar esta reserva' });
            return;
        }
        if (avisoActual.estado_reserva !== 'aceptado') {
            response.status(400).json({ error: 'Sólo se pueden cancelar reservas aceptadas' });
            return;
        }
        // Actualizar la reserva: marcar como rechazado/cancelado y guardar motivo
        const avisoActualizado = yield AvisoModel_1.default.findOneAndUpdate({ _id: avisoId }, { $set: { estado_reserva: 'rechazado', cancel_motivo: String(motivo !== null && motivo !== void 0 ? motivo : '').trim() } }, { new: true }).lean();
        // Crear un aviso para el prestador informando de la cancelación
        try {
            if (avisoActual.prestador_id) {
                const avisoPrestador = {
                    prestador_id: avisoActual.prestador_id,
                    cliente_id: idCliente,
                    tipo: 'solicitud_rechazada',
                    reserva_id: avisoId,
                    trabajo_titulo: avisoActual.trabajo_titulo,
                    trabajo_descripcion: avisoActual.trabajo_descripcion,
                    categoria: avisoActual.categoria,
                    subcategoria: avisoActual.subcategoria,
                    ubicacion: avisoActual.ubicacion,
                    presupuesto: avisoActual.presupuesto || 0,
                    fecha_reserva: avisoActual.fecha_reserva || '',
                    hora_reserva: avisoActual.hora_reserva || '',
                    leido: false,
                    cancel_motivo: String(motivo !== null && motivo !== void 0 ? motivo : '').trim(),
                };
                yield AvisoModel_1.default.create(avisoPrestador);
            }
        }
        catch (err) {
            console.error('Error creando aviso de cancelación para prestador:', err);
        }
        response.status(200).json({ mensaje: 'Reserva cancelada correctamente', reserva: avisoActualizado });
    }
    catch (error) {
        console.error('Error cancelando reserva:', error);
        response.status(500).json({ error: 'No se pudo cancelar la reserva' });
    }
}));
// PUT /reservas/:id/resena - Crear o actualizar reseña de una reserva (por el cliente)
routerReservas.put('/:id/resena', (request, response) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const idCliente = obtenerIdClienteDesdeToken(request.headers.authorization);
        const avisoId = String((_a = request.params.id) !== null && _a !== void 0 ? _a : '').trim();
        const { calificacion, comentario } = request.body;
        if (!idCliente || !mongoose_1.default.Types.ObjectId.isValid(idCliente)) {
            response.status(401).json({ error: 'Token inválido o ausente' });
            return;
        }
        if (!mongoose_1.default.Types.ObjectId.isValid(avisoId)) {
            response.status(400).json({ error: 'ID de reserva inválido' });
            return;
        }
        // Validar calificación
        if (!calificacion || calificacion < 1 || calificacion > 5 || !Number.isInteger(calificacion)) {
            response.status(400).json({ error: 'La calificación debe ser un número entre 1 y 5' });
            return;
        }
        // Validar comentario
        if (!comentario || String(comentario).trim().length === 0) {
            response.status(400).json({ error: 'El comentario no puede estar vacío' });
            return;
        }
        // Encontrar la reserva con el cliente
        const cliente = yield ClienteModel_1.default.findById(idCliente).select({ email: 1 }).lean();
        const emailCliente = typeof (cliente === null || cliente === void 0 ? void 0 : cliente.email) === 'string'
            ? cliente.email.toLowerCase().trim()
            : '';
        const filtroReserva = emailCliente
            ? {
                _id: avisoId,
                tipo: 'reserva',
                $or: [
                    { cliente_id: idCliente },
                    { cliente_email: emailCliente },
                ],
            }
            : {
                _id: avisoId,
                tipo: 'reserva',
                cliente_id: idCliente,
            };
        const avisoActualizado = yield AvisoModel_1.default.findOneAndUpdate(filtroReserva, {
            $set: {
                resena_calificacion: calificacion,
                resena_comentario: String(comentario).trim(),
                resena_fecha: new Date().toISOString(),
                tiene_resena: true,
            },
        }, { new: true }).lean();
        if (!avisoActualizado) {
            response.status(404).json({ error: 'Reserva no encontrada o no tienes permiso para dejar una reseña' });
            return;
        }
        response.status(200).json({
            mensaje: 'Reseña guardada correctamente',
            reserva: avisoActualizado,
        });
    }
    catch (error) {
        console.error('Error guardando reseña:', error);
        response.status(500).json({ error: 'No se pudo guardar la reseña' });
    }
}));
// DELETE /reservas/:id - Eliminar una reserva
routerReservas.delete('/:id', (request, response) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const idPrestador = obtenerIdClienteDesdeToken(request.headers.authorization);
        const avisoId = String((_a = request.params.id) !== null && _a !== void 0 ? _a : '').trim();
        if (!idPrestador || !mongoose_1.default.Types.ObjectId.isValid(idPrestador)) {
            response.status(401).json({ error: 'Token inválido o ausente' });
            return;
        }
        if (!mongoose_1.default.Types.ObjectId.isValid(avisoId)) {
            response.status(400).json({ error: 'ID de reserva inválido' });
            return;
        }
        const resultado = yield AvisoModel_1.default.deleteOne({
            _id: avisoId,
            prestador_id: idPrestador,
            tipo: 'reserva',
        });
        if (resultado.deletedCount === 0) {
            response.status(404).json({ error: 'Reserva no encontrada' });
            return;
        }
        response.status(200).json({ mensaje: 'Reserva eliminada correctamente' });
    }
    catch (error) {
        console.error('Error eliminando reserva:', error);
        response.status(500).json({ error: 'No se pudo eliminar la reserva' });
    }
}));
// GET /reservas/prestador/:prestadorId/resenas - Obtener reseñas de un prestador específico (público)
routerReservas.get('/prestador/:prestadorId/resenas', (request, response) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const prestadorId = String((_a = request.params.prestadorId) !== null && _a !== void 0 ? _a : '').trim();
        if (!mongoose_1.default.Types.ObjectId.isValid(prestadorId)) {
            response.status(400).json({ error: 'ID de prestador inválido' });
            return;
        }
        // Obtener todas las reservas donde este prestador tiene reseñas
        const resenasRecibidas = yield AvisoModel_1.default.find({
            prestador_id: prestadorId,
            tipo: 'reserva',
            tiene_resena: true,
        }, {
            cliente_nombre: 1,
            resena_calificacion: 1,
            resena_comentario: 1,
            resena_fecha: 1,
            trabajo_titulo: 1,
        }).lean();
        response.status(200).json(resenasRecibidas || []);
    }
    catch (error) {
        console.error('Error obteniendo reseñas del prestador:', error);
        response.status(500).json({ error: 'No se pudieron obtener las reseñas del prestador' });
    }
}));
// GET /reservas/resenas/recibidas - Obtener reseñas recibidas como prestador
routerReservas.get('/resenas/recibidas', (request, response) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const idPrestador = obtenerIdClienteDesdeToken(request.headers.authorization);
        if (!idPrestador || !mongoose_1.default.Types.ObjectId.isValid(idPrestador)) {
            response.status(401).json({ error: 'Token inválido o ausente' });
            return;
        }
        // Obtener todas las reservas donde este usuario es prestador y tiene reseña
        const resenasRecibidas = yield AvisoModel_1.default.find({
            prestador_id: idPrestador,
            tipo: 'reserva',
            tiene_resena: true,
        }, {
            cliente_nombre: 1,
            resena_calificacion: 1,
            resena_comentario: 1,
            resena_fecha: 1,
            trabajo_titulo: 1,
        }).lean();
        response.status(200).json(resenasRecibidas || []);
    }
    catch (error) {
        console.error('Error obteniendo reseñas recibidas:', error);
        response.status(500).json({ error: 'No se pudieron obtener las reseñas recibidas' });
    }
}));
exports.default = routerReservas;
//# sourceMappingURL=endpointsReservas.js.map