import jsonwebtoken, { Secret } from 'jsonwebtoken';

const DEFAULT_REFRESH_EXPIRATION = '5h';

function obtenerJwtSecret(): Secret {
  if (!process.env.JWT_SECRET) {
    throw new Error('La variable JWT_SECRET no está configurada en backend/.env');
  }

  return process.env.JWT_SECRET as Secret;
}

export default {
  generarJWT: (
    payload: { [key: string]: any },
    vigencia: string | number,
    withRefresh: boolean,
    options?: jsonwebtoken.SignOptions
  ): string[] => {
    try {
      const tokens: string[] = [
        { tipo: 'accessToken', expiresIn: vigencia },
        { tipo: 'refreshToken', expiresIn: DEFAULT_REFRESH_EXPIRATION }
      ].map((tok: { tipo: string; expiresIn: string | number }) => {
        const tokenPayload = tok.tipo === 'accessToken' ? { ...payload } : { email: payload.email };

        return jsonwebtoken.sign(
          tokenPayload,
          obtenerJwtSecret(),
          { ...options, expiresIn: tok.expiresIn } as jsonwebtoken.SignOptions
        );
      });

      return withRefresh ? tokens : tokens.slice(0, 1);
    } catch (error: any) {
      console.log('Error al generar JWT:', error);
      return [];
    }
  },

  verificarJWT: (token: string): { valid: boolean; payload?: any; message?: string } => {
    try {
      const payload = jsonwebtoken.verify(token, obtenerJwtSecret());
      return { valid: true, payload };
    } catch (error: any) {
      console.log('Error al verificar JWT:', error);
      return { valid: false, message: error.message };
    }
  },

  listaClaimsJWT: (token: string): { [key: string]: any } | null => {
    try {
      const payload = jsonwebtoken.decode(token);
      if (typeof payload === 'object' && payload !== null) {
        return payload as { [key: string]: any };
      }

      return null;
    } catch (error: any) {
      console.log('Error al decodificar JWT:', error);
      return null;
    }
  }
};
