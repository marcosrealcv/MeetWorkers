"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = configurarEnrutamiento;
const endpointsCategorias_1 = __importDefault(require("./endpointsCategorias"));
const endpointsClientes_1 = __importDefault(require("./endpointsClientes"));
const endpointsTrabajos_1 = __importDefault(require("./endpointsTrabajos"));
const endpointsAvisos_1 = __importDefault(require("./endpointsAvisos"));
const endpointsReservas_1 = __importDefault(require("./endpointsReservas"));
function configurarEnrutamiento(app) {
    app.use('/api', endpointsCategorias_1.default);
    app.use('/api/clientes', endpointsClientes_1.default);
    app.use('/api/trabajos', endpointsTrabajos_1.default);
    app.use('/api/avisos', endpointsAvisos_1.default);
    app.use('/api/reservas', endpointsReservas_1.default);
}
//# sourceMappingURL=config_enrutamiento.js.map