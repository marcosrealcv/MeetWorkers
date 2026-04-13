"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = config_pipeline;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
function config_pipeline(app) {
    app.use(express_1.default.json({ limit: '25mb' }));
    app.use(express_1.default.urlencoded({ extended: true, limit: '25mb' }));
    app.use((0, cors_1.default)());
    app.use((error, _request, response, next) => {
        if ((error === null || error === void 0 ? void 0 : error.type) === 'entity.too.large') {
            response.status(413).json({ error: 'Las fotos superan el tamaño permitido del formulario' });
            return;
        }
        next(error);
    });
}
//# sourceMappingURL=config_pipeline.js.map