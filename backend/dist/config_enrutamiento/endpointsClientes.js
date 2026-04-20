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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const mongoose_1 = __importDefault(require("mongoose"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const ClienteModel_1 = __importDefault(require("../modelos/ClienteModel"));
const JwtService_1 = __importDefault(require("../servicios/JwtService"));
const routerCliente = (0, express_1.Router)();
const BCRYPT_SALT_ROUNDS = 10;
const JWT_EXPIRATION = '12h';
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/;
function normalizarClientePayload(payload) {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o;
    const contrasena = typeof payload['contraseña'] === 'string' ? payload['contraseña'] : '';
    const costeHora = typeof payload.coste_hora === 'number'
        ? payload.coste_hora
        : Number((_a = payload.coste_hora) !== null && _a !== void 0 ? _a : 0);
    return {
        nombre: String((_b = payload.nombre) !== null && _b !== void 0 ? _b : '').trim(),
        apellido: String((_c = payload.apellido) !== null && _c !== void 0 ? _c : '').trim(),
        telefono: String((_d = payload.telefono) !== null && _d !== void 0 ? _d : '').trim(),
        email: String((_e = payload.email) !== null && _e !== void 0 ? _e : '').trim().toLowerCase(),
        contrasena,
        direccion: String((_f = payload.direccion) !== null && _f !== void 0 ? _f : '').trim(),
        descripcion: String((_g = payload.descripcion) !== null && _g !== void 0 ? _g : '').trim(),
        es_prestador: Boolean(payload.es_prestador),
        tipo_servicio: String((_h = payload.tipo_servicio) !== null && _h !== void 0 ? _h : '').trim(),
        categoria: String((_j = payload.categoria) !== null && _j !== void 0 ? _j : '').trim(),
        subcategoria: String((_k = payload.subcategoria) !== null && _k !== void 0 ? _k : '').trim(),
        descripcion_servicio: String((_l = payload.descripcion_servicio) !== null && _l !== void 0 ? _l : '').trim(),
        ubicacion_servicio: String((_m = payload.ubicacion_servicio) !== null && _m !== void 0 ? _m : '').trim(),
        direccion_servicio: String((_o = payload.direccion_servicio) !== null && _o !== void 0 ? _o : '').trim(),
        coste_hora: Number.isFinite(costeHora) ? costeHora : 0,
    };
}
function validarCliente(cliente) {
    if (!cliente.nombre || !cliente.apellido || !cliente.telefono || !cliente.email || !cliente.contrasena || !cliente.direccion) {
        return 'Faltan datos obligatorios para el registro';
    }
    if (!PASSWORD_REGEX.test(cliente.contrasena)) {
        return 'La contraseña debe tener al menos 8 caracteres, mayúscula, minúscula, número y símbolo';
    }
    return null;
}
function clienteSinContrasena(cliente) {
    const { contrasena: _contrasena } = cliente, clienteSinPassword = __rest(cliente, ["contrasena"]);
    return clienteSinPassword;
}
function esHashBcrypt(valor) {
    return /^\$2[aby]\$\d{2}\$/.test(valor);
}
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
function sanitizarCamposEditables(payload) {
    const clienteEditable = {};
    if (typeof payload.nombre === 'string') {
        clienteEditable.nombre = payload.nombre.trim();
    }
    if (typeof payload.apellido === 'string') {
        clienteEditable.apellido = payload.apellido.trim();
    }
    if (typeof payload.telefono === 'string') {
        clienteEditable.telefono = payload.telefono.trim();
    }
    if (typeof payload.email === 'string') {
        clienteEditable.email = payload.email.trim().toLowerCase();
    }
    if (typeof payload.direccion === 'string') {
        clienteEditable.direccion = payload.direccion.trim();
    }
    if (typeof payload.descripcion === 'string') {
        clienteEditable.descripcion = payload.descripcion.trim();
    }
    if (typeof payload.es_prestador === 'boolean') {
        clienteEditable.es_prestador = payload.es_prestador;
    }
    if (typeof payload.tipo_servicio === 'string') {
        clienteEditable.tipo_servicio = payload.tipo_servicio.trim();
    }
    if (typeof payload.categoria === 'string') {
        clienteEditable.categoria = payload.categoria.trim();
    }
    if (typeof payload.subcategoria === 'string') {
        clienteEditable.subcategoria = payload.subcategoria.trim();
    }
    if (typeof payload.descripcion_servicio === 'string') {
        clienteEditable.descripcion_servicio = payload.descripcion_servicio.trim();
    }
    if (typeof payload.ubicacion_servicio === 'string') {
        clienteEditable.ubicacion_servicio = payload.ubicacion_servicio.trim();
    }
    if (typeof payload.direccion_servicio === 'string') {
        clienteEditable.direccion_servicio = payload.direccion_servicio.trim();
    }
    if (typeof payload.coste_hora === 'number') {
        clienteEditable.coste_hora = payload.coste_hora;
    }
    if (typeof payload.coste_hora === 'string') {
        const costeHora = Number(payload.coste_hora);
        if (Number.isFinite(costeHora)) {
            clienteEditable.coste_hora = costeHora;
        }
    }
    return clienteEditable;
}
routerCliente.post('/registro', (request, response) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const nuevoCliente = normalizarClientePayload(request.body);
        const errorValidacion = validarCliente(nuevoCliente);
        if (errorValidacion) {
            response.status(400).json({ error: errorValidacion });
            return;
        }
        const clienteExistente = yield ClienteModel_1.default.findOne({ email: nuevoCliente.email }).lean();
        if (clienteExistente) {
            response.status(409).json({ error: 'Ya existe una cuenta con este email' });
            return;
        }
        nuevoCliente.contrasena = yield bcrypt_1.default.hash(nuevoCliente.contrasena, BCRYPT_SALT_ROUNDS);
        const clienteGuardado = yield ClienteModel_1.default.create(nuevoCliente);
        const clienteSinPassword = clienteSinContrasena(clienteGuardado.toObject());
        const tokens = JwtService_1.default.generarJWT({ email: clienteGuardado.email, idCliente: clienteGuardado._id }, JWT_EXPIRATION, false, { subject: String(clienteGuardado._id) });
        if (tokens.length === 0) {
            response.status(500).json({ error: 'No se pudo generar el token de sesión' });
            return;
        }
        response.status(201).json({ cliente: clienteSinPassword, token: tokens[0] });
    }
    catch (error) {
        console.error('Error registrando cliente en MongoDB:', error);
        response.status(500).json({ error: 'No se pudo registrar el cliente' });
    }
}));
routerCliente.post('/login', (request, response) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d;
    try {
        const email = String((_b = (_a = request.body) === null || _a === void 0 ? void 0 : _a.email) !== null && _b !== void 0 ? _b : '').trim().toLowerCase();
        const contrasena = String((_d = (_c = request.body) === null || _c === void 0 ? void 0 : _c.contrasena) !== null && _d !== void 0 ? _d : '');
        if (!email || !contrasena) {
            response.status(400).json({ error: 'Email y contraseña son obligatorios' });
            return;
        }
        const cliente = yield ClienteModel_1.default.findOne({ email }).lean();
        if (!cliente) {
            response.status(401).json({ error: 'Credenciales incorrectas' });
            return;
        }
        let credencialesValidas = false;
        if (esHashBcrypt(cliente.contrasena)) {
            credencialesValidas = yield bcrypt_1.default.compare(contrasena, cliente.contrasena);
        }
        else {
            credencialesValidas = cliente.contrasena === contrasena;
            if (credencialesValidas) {
                const hashActualizado = yield bcrypt_1.default.hash(contrasena, BCRYPT_SALT_ROUNDS);
                yield ClienteModel_1.default.updateOne({ _id: cliente._id }, { $set: { contrasena: hashActualizado } });
            }
        }
        if (!credencialesValidas) {
            response.status(401).json({ error: 'Credenciales incorrectas' });
            return;
        }
        const tokens = JwtService_1.default.generarJWT({ email: cliente.email, idCliente: cliente._id }, JWT_EXPIRATION, false, { subject: String(cliente._id) });
        if (tokens.length === 0) {
            response.status(500).json({ error: 'No se pudo generar el token de sesión' });
            return;
        }
        response.status(200).json({
            cliente: clienteSinContrasena(cliente),
            token: tokens[0],
        });
    }
    catch (error) {
        console.error('Error iniciando sesión de cliente:', error);
        response.status(500).json({ error: 'No se pudo iniciar sesión' });
    }
}));
routerCliente.get('/perfil', (request, response) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const idCliente = obtenerIdClienteDesdeToken(request.headers.authorization);
        if (!idCliente || !mongoose_1.default.Types.ObjectId.isValid(idCliente)) {
            response.status(401).json({ error: 'Token inválido o ausente' });
            return;
        }
        const cliente = yield ClienteModel_1.default.findById(idCliente).lean();
        if (!cliente) {
            response.status(404).json({ error: 'Cliente no encontrado' });
            return;
        }
        response.status(200).json(clienteSinContrasena(cliente));
    }
    catch (error) {
        console.error('Error obteniendo perfil desde JWT:', error);
        response.status(500).json({ error: 'No se pudo obtener el perfil del cliente' });
    }
}));
routerCliente.put('/perfil', (request, response) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const idCliente = obtenerIdClienteDesdeToken(request.headers.authorization);
        if (!idCliente || !mongoose_1.default.Types.ObjectId.isValid(idCliente)) {
            response.status(401).json({ error: 'Token inválido o ausente' });
            return;
        }
        const camposActualizables = sanitizarCamposEditables(request.body);
        if (Object.keys(camposActualizables).length === 0) {
            response.status(400).json({ error: 'No hay campos válidos para actualizar' });
            return;
        }
        if (camposActualizables.email) {
            const clienteConMismoEmail = yield ClienteModel_1.default.findOne({
                email: camposActualizables.email,
                _id: { $ne: idCliente },
            }).lean();
            if (clienteConMismoEmail) {
                response.status(409).json({ error: 'Ya existe una cuenta con este email' });
                return;
            }
        }
        if (camposActualizables.es_prestador === false) {
            camposActualizables.tipo_servicio = '';
            camposActualizables.categoria = '';
            camposActualizables.subcategoria = '';
            camposActualizables.descripcion_servicio = '';
            camposActualizables.ubicacion_servicio = '';
            camposActualizables.direccion_servicio = '';
            camposActualizables.coste_hora = 0;
        }
        const clienteActualizado = yield ClienteModel_1.default.findByIdAndUpdate(idCliente, { $set: camposActualizables }, { new: true }).lean();
        if (!clienteActualizado) {
            response.status(404).json({ error: 'Cliente no encontrado' });
            return;
        }
        response.status(200).json(clienteSinContrasena(clienteActualizado));
    }
    catch (error) {
        console.error('Error actualizando perfil de cliente:', error);
        response.status(500).json({ error: 'No se pudo actualizar el perfil del cliente' });
    }
}));
routerCliente.get('/:id', (request, response) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const id = String((_a = request.params.id) !== null && _a !== void 0 ? _a : '');
        if (!mongoose_1.default.Types.ObjectId.isValid(id)) {
            response.status(400).json({ error: 'Identificador de cliente inválido' });
            return;
        }
        const cliente = yield ClienteModel_1.default.findById(id).lean();
        if (!cliente) {
            response.status(404).json({ error: 'Cliente no encontrado' });
            return;
        }
        response.status(200).json(clienteSinContrasena(cliente));
    }
    catch (error) {
        console.error('Error obteniendo perfil de cliente:', error);
        response.status(500).json({ error: 'No se pudo obtener el perfil del cliente' });
    }
}));
// GET /clientes/buscar/prestador/:nombre - Buscar prestador por nombre
routerCliente.get('/buscar/prestador/:nombre', (request, response) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const nombre = String((_a = request.params.nombre) !== null && _a !== void 0 ? _a : '').trim();
        if (!nombre || nombre.length < 2) {
            response.status(400).json({ error: 'El nombre debe tener al menos 2 caracteres' });
            return;
        }
        const cliente = yield ClienteModel_1.default.findOne({
            nombre: { $regex: nombre, $options: 'i' },
            es_prestador: true,
        })
            .select('_id nombre apellido email categoria subcategoria coste_hora')
            .lean();
        if (!cliente) {
            response.status(404).json({ error: 'Prestador no encontrado' });
            return;
        }
        response.status(200).json(cliente);
    }
    catch (error) {
        console.error('Error buscando prestador:', error);
        response.status(500).json({ error: 'No se pudo buscar el prestador' });
    }
}));
// GET /clientes/prestadores - Obtener todos los prestadores
routerCliente.get('/prestadores', (request, response) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const prestadores = yield ClienteModel_1.default.find({ es_prestador: true })
            .select('_id nombre apellido email categoria subcategoria coste_hora descripcion_servicio')
            .lean();
        response.status(200).json(prestadores);
    }
    catch (error) {
        console.error('Error obteniendo prestadores:', error);
        response.status(500).json({ error: 'No se pudieron obtener los prestadores' });
    }
}));
exports.default = routerCliente;
//# sourceMappingURL=endpointsClientes.js.map