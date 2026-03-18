import { Express } from 'express';
import routerCategorias from './endpointsCategorias';
import routerCliente from './endpointsClientes';

export default function configurarEnrutamiento(app: Express): void {
  app.use('/api', routerCategorias);
  app.use('/api/clientes', routerCliente);
}
