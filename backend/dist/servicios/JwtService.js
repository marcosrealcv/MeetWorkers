"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const DEFAULT_REFRESH_EXPIRATION = '5h';
function obtenerJwtSecret() {
    if (!process.env.JWT_SECRET) {
        throw new Error('La variable JWT_SECRET no está configurada en backend/.env');
    }
    return process.env.JWT_SECRET;
}
exports.default = {
    generarJWT: (payload, vigencia, withRefresh, options) => {
        try {
            const tokens = [
                { tipo: 'accessToken', expiresIn: vigencia },
                { tipo: 'refreshToken', expiresIn: DEFAULT_REFRESH_EXPIRATION }
            ].map((tok) => {
                const tokenPayload = tok.tipo === 'accessToken' ? Object.assign({}, payload) : { email: payload.email };
                return jsonwebtoken_1.default.sign(tokenPayload, obtenerJwtSecret(), Object.assign(Object.assign({}, options), { expiresIn: tok.expiresIn }));
            });
            return withRefresh ? tokens : tokens.slice(0, 1);
        }
        catch (error) {
            console.log('Error al generar JWT:', error);
            return [];
        }
    },
    verificarJWT: (token) => {
        try {
            const payload = jsonwebtoken_1.default.verify(token, obtenerJwtSecret());
            return { valid: true, payload };
        }
        catch (error) {
            console.log('Error al verificar JWT:', error);
            return { valid: false, message: error.message };
        }
    },
    listaClaimsJWT: (token) => {
        try {
            const payload = jsonwebtoken_1.default.decode(token);
            if (typeof payload === 'object' && payload !== null) {
                return payload;
            }
            return null;
        }
        catch (error) {
            console.log('Error al decodificar JWT:', error);
            return null;
        }
    }
};
//# sourceMappingURL=JwtService.js.map