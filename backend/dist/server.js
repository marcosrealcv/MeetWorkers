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
require("dotenv/config");
const express_1 = __importDefault(require("express"));
const mongoose_1 = __importDefault(require("mongoose"));
const config_pipeline_1 = __importDefault(require("./config_server_express/config_pipeline"));
const config_enrutamiento_1 = __importDefault(require("./config_enrutamiento/config_enrutamiento"));
const JwtService_1 = __importDefault(require("./servicios/JwtService"));
const app = (0, express_1.default)();
(0, config_pipeline_1.default)(app);
(0, config_enrutamiento_1.default)(app);
function startServer() {
    return __awaiter(this, void 0, void 0, function* () {
        const mongoUrl = process.env.URL_MONGODB;
        if (!mongoUrl) {
            throw new Error('La variable URL_MONGODB no está configurada en backend/.env');
        }
        const testToken = JwtService_1.default.generarJWT({ service: 'startup-check' }, '10m', false);
        if (testToken.length === 0) {
            throw new Error('No se pudo inicializar JwtService: revisa JWT_SECRET en backend/.env');
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