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
require("dotenv/config");
const express_1 = __importDefault(require("express"));
const mongoose_1 = __importStar(require("mongoose"));
const config_pipeline_1 = __importDefault(require("./config_server_express/config_pipeline"));
const app = (0, express_1.default)();
(0, config_pipeline_1.default)(app);
const categoriaSchema = new mongoose_1.Schema({
    nombreCategoria: { type: String, required: true },
    pathCategoria: { type: String, required: true },
}, {
    collection: 'categorias',
    versionKey: false,
});
const CategoriaModel = mongoose_1.default.model('Categoria', categoriaSchema);
app.get('/api/categorias', (_request, response) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const categorias = yield CategoriaModel.find({}, { nombreCategoria: 1, pathCategoria: 1 }).lean();
        response.status(200).json(categorias);
    }
    catch (error) {
        console.error('Error obteniendo categorías desde MongoDB:', error);
        response.status(500).json({ error: 'No se pudieron obtener las categorías' });
    }
}));
function startServer() {
    return __awaiter(this, void 0, void 0, function* () {
        const mongoUrl = process.env.URL_MONGODB;
        if (!mongoUrl) {
            throw new Error('La variable URL_MONGODB no está configurada en backend/.env');
        }
        yield mongoose_1.default.connect(mongoUrl);
        console.log('...Conectado a MongoDB...');
        app.listen(3000, (error) => {
            if (error) {
                console.log('Error al INICIAR servidor WEB EXPRESS en puerto 3000:', error);
            }
            else {
                console.log('...Servidor WEB EXPRESS iniciado en puerto 3000...');
            }
        });
    });
}
void startServer().catch((error) => {
    console.error('Error inicializando backend:', error);
    process.exit(1);
});
//# sourceMappingURL=server.js.map