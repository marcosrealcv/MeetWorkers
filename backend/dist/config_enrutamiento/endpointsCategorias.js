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
const CategoriaModel_1 = __importDefault(require("../modelos/CategoriaModel"));
const ClienteModel_1 = __importDefault(require("../modelos/ClienteModel"));
const routerCategorias = (0, express_1.Router)();
// Obtener solo categorías principales (pathCategoria de 1 dígito)
routerCategorias.get('/categorias', (_request, response) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const categorias = yield CategoriaModel_1.default.find({ pathCategoria: /^\d+$/ }, // Solo números simples (1, 2, 3, etc.)
        { nombreCategoria: 1, pathCategoria: 1 }).lean();
        response.status(200).json(categorias);
    }
    catch (error) {
        console.error('Error obteniendo categorías desde MongoDB:', error);
        response.status(500).json({ error: 'No se pudieron obtener las categorías' });
    }
}));
// Obtener subcategorías por categoría principal
routerCategorias.get('/subcategorias/:pathCategoria', (request, response) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { pathCategoria } = request.params;
        const subcategorias = yield CategoriaModel_1.default.find({ pathCategoria: new RegExp(`^${pathCategoria}-`) }, // Ej: 1-, 2-, etc.
        { nombreCategoria: 1, pathCategoria: 1 }).lean();
        response.status(200).json(subcategorias);
    }
    catch (error) {
        console.error('Error obteniendo subcategorías desde MongoDB:', error);
        response.status(500).json({ error: 'No se pudieron obtener las subcategorías' });
    }
}));
// Obtener prestadores por subcategoría
routerCategorias.get('/prestadores-categoria/:pathCategoria', (request, response) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const pathCategoria = request.params.pathCategoria;
        if (typeof pathCategoria !== 'string') {
            response.status(400).json({ error: 'La subcategoria indicada no es valida' });
            return;
        }
        const subcategoria = yield CategoriaModel_1.default.findOne({ pathCategoria }, { nombreCategoria: 1 }).lean();
        const nombreSubcategoria = typeof (subcategoria === null || subcategoria === void 0 ? void 0 : subcategoria.nombreCategoria) === 'string'
            ? subcategoria.nombreCategoria.trim()
            : '';
        const filtroSubcategoria = [
            { subcategoria: pathCategoria },
            { categoria: pathCategoria },
            { tipo_servicio: pathCategoria },
        ];
        if (nombreSubcategoria) {
            const nombreSubcategoriaEscapado = nombreSubcategoria.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            const regexNombreSubcategoria = new RegExp(`^${nombreSubcategoriaEscapado}$`, 'i');
            filtroSubcategoria.push({ subcategoria: regexNombreSubcategoria }, { categoria: regexNombreSubcategoria }, { tipo_servicio: regexNombreSubcategoria });
        }
        const prestadores = yield ClienteModel_1.default.find({
            es_prestador: true,
            $or: filtroSubcategoria,
        }, {
            nombre: 1,
            apellido: 1,
            descripcion_servicio: 1,
            coste_hora: 1,
            subcategoria: 1,
            categoria: 1
        }).lean();
        response.status(200).json(prestadores);
    }
    catch (error) {
        console.error('Error obteniendo prestadores desde MongoDB:', error);
        response.status(500).json({ error: 'No se pudieron obtener los prestadores' });
    }
}));
// Obtener todos los prestadores activos
routerCategorias.get('/prestadores', (_request, response) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const prestadores = yield ClienteModel_1.default.find({ es_prestador: true }, {
            nombre: 1,
            apellido: 1,
            descripcion_servicio: 1,
            coste_hora: 1,
            subcategoria: 1,
            categoria: 1
        }).lean();
        response.status(200).json(prestadores);
    }
    catch (error) {
        console.error('Error obteniendo prestadores desde MongoDB:', error);
        response.status(500).json({ error: 'No se pudieron obtener los prestadores' });
    }
}));
exports.default = routerCategorias;
//# sourceMappingURL=endpointsCategorias.js.map