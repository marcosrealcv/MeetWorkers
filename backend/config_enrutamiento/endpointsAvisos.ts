import { Request, Response, Router } from 'express';
import mongoose from 'mongoose';
import AvisoModel from '../modelos/AvisoModel';
import ClienteModel from '../modelos/ClienteModel';
import JwtService from '../servicios/JwtService';

const routerAvisos = Router();

function extraerTokenBearer(authorizationHeader: string | undefined): string | null {
  if (!authorizationHeader?.startsWith('Bearer ')) {
    return null;
  }

  return authorizationHeader.slice('Bearer '.length);
}

function obtenerIdClienteDesdeToken(authorizationHeader: string | undefined): string | null {
  const token = extraerTokenBearer(authorizationHeader);

  if (!token) {
    return null;
  }

  const { valid, payload } = JwtService.verificarJWT(token);
  if (!valid || !payload || typeof payload !== 'object') {
    return null;
  }

  if (typeof payload.sub === 'string' && payload.sub.trim() !== '') {
    return payload.sub;
  }

  if (typeof payload.idCliente === 'string' && payload.idCliente.trim() !== '') {
    return payload.idCliente;
  }

  return null;
}

routerAvisos.get('/mis-avisos', async (request: Request, response: Response) => {
  try {
    const idCliente = obtenerIdClienteDesdeToken(request.headers.authorization);

    if (!idCliente || !mongoose.Types.ObjectId.isValid(idCliente)) {
      response.status(401).json({ error: 'Token inválido o ausente' });
      return;
    }

    const cliente = await ClienteModel.findById(idCliente, { es_prestador: 1 }).lean();

    if (!cliente) {
      response.status(404).json({ error: 'Cliente no encontrado' });
      return;
    }

    if (!cliente.es_prestador) {
      response.status(200).json([]);
      return;
    }

    const avisos = await AvisoModel.find({ prestador_id: idCliente })
      .sort({ leido: 1, createdAt: -1 })
      .lean();

    response.status(200).json(avisos);
  } catch (error) {
    console.error('Error obteniendo avisos del prestador:', error);
    response.status(500).json({ error: 'No se pudieron obtener los avisos' });
  }
});

routerAvisos.put('/:id/leido', async (request: Request, response: Response) => {
  try {
    const idCliente = obtenerIdClienteDesdeToken(request.headers.authorization);
    const idAviso = String(request.params.id ?? '').trim();

    if (!idCliente || !mongoose.Types.ObjectId.isValid(idCliente)) {
      response.status(401).json({ error: 'Token inválido o ausente' });
      return;
    }

    if (!idAviso || !mongoose.Types.ObjectId.isValid(idAviso)) {
      response.status(400).json({ error: 'Identificador de aviso inválido' });
      return;
    }

    const avisoActualizado = await AvisoModel.findOneAndUpdate(
      { _id: idAviso, prestador_id: idCliente },
      { $set: { leido: true } },
      { new: true }
    ).lean();

    if (!avisoActualizado) {
      response.status(404).json({ error: 'Aviso no encontrado' });
      return;
    }

    response.status(200).json(avisoActualizado);
  } catch (error) {
    console.error('Error marcando aviso como leído:', error);
    response.status(500).json({ error: 'No se pudo actualizar el aviso' });
  }
});

routerAvisos.delete('/:id', async (request: Request, response: Response) => {
  try {
    const idCliente = obtenerIdClienteDesdeToken(request.headers.authorization);
    const idAviso = String(request.params.id ?? '').trim();

    if (!idCliente || !mongoose.Types.ObjectId.isValid(idCliente)) {
      response.status(401).json({ error: 'Token inválido o ausente' });
      return;
    }

    if (!idAviso || !mongoose.Types.ObjectId.isValid(idAviso)) {
      response.status(400).json({ error: 'Identificador de aviso inválido' });
      return;
    }

    const cliente = await ClienteModel.findById(idCliente, { es_prestador: 1 }).lean();

    if (!cliente) {
      response.status(404).json({ error: 'Cliente no encontrado' });
      return;
    }

    if (!cliente.es_prestador) {
      response.status(403).json({ error: 'Solo un prestador puede eliminar avisos' });
      return;
    }

    const resultadoEliminacion = await AvisoModel.deleteOne({
      _id: idAviso,
      prestador_id: idCliente,
    });

    if (!resultadoEliminacion.deletedCount) {
      response.status(404).json({ error: 'Aviso no encontrado' });
      return;
    }

    response.status(200).json({ mensaje: 'Aviso eliminado correctamente' });
  } catch (error) {
    console.error('Error eliminando aviso del prestador:', error);
    response.status(500).json({ error: 'No se pudo eliminar el aviso' });
  }
});

export default routerAvisos;