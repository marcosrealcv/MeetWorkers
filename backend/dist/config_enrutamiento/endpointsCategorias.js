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
const routerCategorias = (0, express_1.Router)();
routerCategorias.get('/categorias', (_request, response) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const categorias = yield CategoriaModel_1.default.find({}, { nombreCategoria: 1, pathCategoria: 1 }).lean();
        response.status(200).json(categorias);
    }
    catch (error) {
        console.error('Error obteniendo categorías desde MongoDB:', error);
        response.status(500).json({ error: 'No se pudieron obtener las categorías' });
    }
}));
exports.default = routerCategorias;
//# sourceMappingURL=endpointsCategorias.js.map