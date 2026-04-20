import { Express } from 'express';
import routerCategorias from './endpointsCategorias';
import routerCliente from './endpointsClientes';
import routerTrabajos from './endpointsTrabajos';
import routerAvisos from './endpointsAvisos';
import routerReservas from './endpointsReservas';

export default function configurarEnrutamiento(app: Express): void {
  app.use('/api', routerCategorias);
  app.use('/api/clientes', routerCliente);
  app.use('/api/trabajos', routerTrabajos);
  app.use('/api/avisos', routerAvisos);
  app.use('/api/reservas', routerReservas);
}
