"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const express_1 = __importDefault(require("express"));
const mongoose_1 = __importDefault(require("mongoose"));
const config_pipeline_1 = __importDefault(require("./config_server_express/config_pipeline"));
const app = (0, express_1.default)();
(0, config_pipeline_1.default)(app);

const categoriaSchema = new mongoose_1.default.Schema(
    {
        nombreCategoria: { type: String, required: true },
        pathCategoria: { type: String, required: true },
    },
    {
        collection: 'categorias',
        versionKey: false,
    }
);

const CategoriaModel = mongoose_1.default.model('Categoria', categoriaSchema);

app.get('/api/categorias', async (_request, response) => {
    try {
        const categorias = await CategoriaModel.find({}, { nombreCategoria: 1, pathCategoria: 1 }).lean();
        response.status(200).json(categorias);
    }
    catch (error) {
        console.error('Error obteniendo categorías desde MongoDB:', error);
        response.status(500).json({ error: 'No se pudieron obtener las categorías' });
    }
});

async function startServer() {
    const mongoUrl = process.env.URL_MONGODB;

    if (!mongoUrl) {
        throw new Error('La variable URL_MONGODB no está configurada en backend/.env');
    }

    await mongoose_1.default.connect(mongoUrl);
    console.log('...Conectado a MongoDB...');

    app.listen(3000, (error) => {
        if (error) {
            console.log('Error al INICIAR servidor WEB EXPRESS en puerto 3000:', error);
        }
        else {
            console.log('...Servidor WEB EXPRESS iniciado en puerto 3000...');
        }
    });
}

void startServer().catch((error) => {
    console.error('Error inicializando backend:', error);
    process.exit(1);
});
