import jsonwebtoken from 'jsonwebtoken';
declare const _default: {
    generarJWT: (payload: {
        [key: string]: any;
    }, vigencia: string | number, withRefresh: boolean, options?: jsonwebtoken.SignOptions) => string[];
    verificarJWT: (token: string) => {
        valid: boolean;
        payload?: any;
        message?: string;
    };
    listaClaimsJWT: (token: string) => {
        [key: string]: any;
    } | null;
};
export default _default;
//# sourceMappingURL=JwtService.d.ts.map