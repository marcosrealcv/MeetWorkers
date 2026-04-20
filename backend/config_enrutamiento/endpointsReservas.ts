import { Request, Response, Router } from 'express';
import mongoose from 'mongoose';
import AvisoModel, { AvisoDocument } from '../modelos/AvisoModel';
import ClienteModel from '../modelos/ClienteModel';
import JwtService from '../servicios/JwtService';

const routerReservas = Router();

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

interface ReservaPayload {
  prestador_id: string;
  cliente_nombre: string;
  cliente_email: string;
  cliente_telefono: string;
  trabajo_titulo: string;
  trabajo_descripcion: string;
  categoria: string;
  subcategoria: string;
  ubicacion: string;
  fecha_reserva: string;
  hora_reserva: string;
  presupuesto?: number;
}

async function generarAvisoReserva(
  prestadorId: string,
  reserva: Omit<AvisoDocument, '_id' | 'createdAt' | 'updatedAt'>
): Promise<boolean> {
  try {
    const avisoReserva: Omit<AvisoDocument, '_id' | 'createdAt' | 'updatedAt'> = {
      ...reserva,
      tipo: 'reserva',
      prestador_id: prestadorId,
      leido: false,
    };

    const aviso = await AvisoModel.create(avisoReserva);
    return !!aviso;
  } catch (error) {
    console.error('Error generando aviso de reserva:', error);
    return false;
  }
}

// GET /reservas - Obtener todas las reservas del prestador autenticado
routerReservas.get('/', async (request: Request, response: Response) => {
  try {
    const idPrestador = obtenerIdClienteDesdeToken(request.headers.authorization);

    if (!idPrestador || !mongoose.Types.ObjectId.isValid(idPrestador)) {
      response.status(401).json({ error: 'Token inválido o ausente' });
      return;
    }

    const avisos = await AvisoModel.find({
      prestador_id: idPrestador,
      tipo: 'reserva',
    })
      .sort({ createdAt: -1 })
      .lean();

    response.status(200).json(avisos);
  } catch (error) {
    console.error('Error obteniendo reservas:', error);
    response.status(500).json({ error: 'No se pudieron obtener las reservas' });
  }
});

// GET /reservas/pendientes - Obtener reservas pendientes del prestador
routerReservas.get('/pendientes', async (request: Request, response: Response) => {
  try {
    const idPrestador = obtenerIdClienteDesdeToken(request.headers.authorization);

    if (!idPrestador || !mongoose.Types.ObjectId.isValid(idPrestador)) {
      response.status(401).json({ error: 'Token inválido o ausente' });
      return;
    }

    const avisos = await AvisoModel.find({
      prestador_id: idPrestador,
      tipo: 'reserva',
      estado_reserva: 'pendiente',
    })
      .sort({ createdAt: -1 })
      .lean();

    response.status(200).json(avisos);
  } catch (error) {
    console.error('Error obteniendo reservas pendientes:', error);
    response.status(500).json({ error: 'No se pudieron obtener las reservas pendientes' });
  }
});

// GET /reservas/mias - Obtener reservas hechas por el cliente autenticado
routerReservas.get('/mias', async (request: Request, response: Response) => {
  try {
    const idCliente = obtenerIdClienteDesdeToken(request.headers.authorization);

    if (!idCliente || !mongoose.Types.ObjectId.isValid(idCliente)) {
      response.status(401).json({ error: 'Token invalido o ausente' });
      return;
    }

    const cliente = await ClienteModel.findById(idCliente).select({ email: 1 }).lean();
    const emailCliente = typeof cliente?.email === 'string'
      ? cliente.email.toLowerCase().trim()
      : '';

    const filtroReservas = emailCliente
      ? {
          tipo: 'reserva',
          $or: [
            { cliente_id: idCliente },
            { cliente_email: emailCliente },
          ],
        }
      : {
          tipo: 'reserva',
          cliente_id: idCliente,
        };

    const avisos = await AvisoModel.find(filtroReservas)
      .sort({ createdAt: -1 })
      .lean();

    response.status(200).json(avisos);
  } catch (error) {
    console.error('Error obteniendo mis reservas:', error);
    response.status(500).json({ error: 'No se pudieron obtener tus reservas' });
  }
});

// POST /reservas - Crear una nueva reserva
routerReservas.post('/', async (request: Request, response: Response) => {
  try {
    const idCliente = obtenerIdClienteDesdeToken(request.headers.authorization);
    const payload = request.body as ReservaPayload;

    // Validaciones básicas
    if (!payload.prestador_id || payload.prestador_id.trim() === '') {
      response.status(400).json({ error: 'ID del prestador inválido' });
      return;
    }

    if (!payload.cliente_nombre || !payload.cliente_email || !payload.cliente_telefono) {
      response.status(400).json({ error: 'Faltan datos del cliente' });
      return;
    }

    if (!payload.trabajo_titulo || !payload.trabajo_descripcion) {
      response.status(400).json({ error: 'Faltan datos del trabajo' });
      return;
    }

    if (!payload.fecha_reserva || !payload.hora_reserva) {
      response.status(400).json({ error: 'Faltan fecha y hora de la reserva' });
      return;
    }

    // Generar ID único para la reserva
    const reservaId = new mongoose.Types.ObjectId().toString();

    // Crear el aviso de reserva
    const avisoReserva: Omit<AvisoDocument, '_id' | 'createdAt' | 'updatedAt'> = {
      prestador_id: String(payload.prestador_id).trim(),
      tipo: 'reserva',
      reserva_id: reservaId,
      trabajo_titulo: payload.trabajo_titulo,
      trabajo_descripcion: `${payload.trabajo_descripcion}\n\nCliente: ${payload.cliente_nombre}\nTeléfono: ${payload.cliente_telefono}`,
      categoria: payload.categoria,
      subcategoria: payload.subcategoria,
      ubicacion: payload.ubicacion,
      presupuesto: payload.presupuesto || 0,
      cliente_id: idCliente || '',
      cliente_nombre: payload.cliente_nombre,
      cliente_email: String(payload.cliente_email).toLowerCase().trim(),
      cliente_telefono: String(payload.cliente_telefono).trim(),
      fecha_reserva: String(payload.fecha_reserva).trim(),
      hora_reserva: String(payload.hora_reserva).trim(),
      estado_reserva: 'pendiente',
      leido: false,
    };

    const avisoGuardado = await AvisoModel.create(avisoReserva);

    response.status(201).json({
      mensaje: 'Reserva creada correctamente. El prestador será notificado.',
      reserva: avisoGuardado.toObject(),
    });
  } catch (error) {
    console.error('Error creando reserva:', error);
    response.status(500).json({ error: 'No se pudo crear la reserva' });
  }
});

// PUT /reservas/:id - Actualizar estado de reserva (aceptar/rechazar)
routerReservas.put('/:id', async (request: Request, response: Response) => {
  try {
    const idPrestador = obtenerIdClienteDesdeToken(request.headers.authorization);
    const avisoId = String(request.params.id ?? '').trim();
    const { estado_reserva } = request.body as { estado_reserva?: string };

    if (!idPrestador || !mongoose.Types.ObjectId.isValid(idPrestador)) {
      response.status(401).json({ error: 'Token inválido o ausente' });
      return;
    }

    if (!mongoose.Types.ObjectId.isValid(avisoId)) {
      response.status(400).json({ error: 'ID de reserva inválido' });
      return;
    }

    if (!['aceptado', 'rechazado', 'pendiente'].includes(estado_reserva || '')) {
      response.status(400).json({ error: 'Estado de reserva inválido' });
      return;
    }

    const avisoActualizado = await AvisoModel.findOneAndUpdate(
      {
        _id: avisoId,
        prestador_id: idPrestador,
        tipo: 'reserva',
      },
      { $set: { estado_reserva } },
      { new: true }
    ).lean();

    if (!avisoActualizado) {
      response.status(404).json({ error: 'Reserva no encontrada' });
      return;
    }

    response.status(200).json({
      mensaje: `Reserva ${estado_reserva} correctamente`,
      reserva: avisoActualizado,
    });
  } catch (error) {
    console.error('Error actualizando reserva:', error);
    response.status(500).json({ error: 'No se pudo actualizar la reserva' });
  }
});

// DELETE /reservas/:id - Eliminar una reserva
routerReservas.delete('/:id', async (request: Request, response: Response) => {
  try {
    const idPrestador = obtenerIdClienteDesdeToken(request.headers.authorization);
    const avisoId = String(request.params.id ?? '').trim();

    if (!idPrestador || !mongoose.Types.ObjectId.isValid(idPrestador)) {
      response.status(401).json({ error: 'Token inválido o ausente' });
      return;
    }

    if (!mongoose.Types.ObjectId.isValid(avisoId)) {
      response.status(400).json({ error: 'ID de reserva inválido' });
      return;
    }

    const resultado = await AvisoModel.deleteOne({
      _id: avisoId,
      prestador_id: idPrestador,
      tipo: 'reserva',
    });

    if (resultado.deletedCount === 0) {
      response.status(404).json({ error: 'Reserva no encontrada' });
      return;
    }

    response.status(200).json({ mensaje: 'Reserva eliminada correctamente' });
  } catch (error) {
    console.error('Error eliminando reserva:', error);
    response.status(500).json({ error: 'No se pudo eliminar la reserva' });
  }
});

export default routerReservas;
