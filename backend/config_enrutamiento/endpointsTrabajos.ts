import { Request, Response, Router } from 'express';
import mongoose from 'mongoose';
import TrabajoSolicitudModel, { TrabajoSolicitudDocument } from '../modelos/TrabajoSolicitudModel';
import ClienteModel from '../modelos/ClienteModel';
import AvisoModel from '../modelos/AvisoModel';
import JwtService from '../servicios/JwtService';

const routerTrabajos = Router();
const TAMANO_MAXIMO_FOTOS_ESTIMADO = 10 * 1024 * 1024;

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

function normalizarTrabajoPayload(payload: Record<string, unknown>): TrabajoSolicitudDocument {
  const fotos = Array.isArray(payload.fotos)
    ? payload.fotos
      .filter((foto): foto is string => typeof foto === 'string')
      .map((foto) => foto.trim())
      .filter(Boolean)
    : [];

  const presupuestoValor = typeof payload.presupuesto === 'number'
    ? payload.presupuesto
    : Number(payload.presupuesto ?? 0);

  return {
    cliente_id: String(payload.cliente_id ?? '').trim(),
    cliente_nombre: String(payload.cliente_nombre ?? '').trim(),
    cliente_email: String(payload.cliente_email ?? '').trim().toLowerCase(),
    cliente_telefono: String(payload.cliente_telefono ?? '').trim(),
    titulo: String(payload.titulo ?? '').trim(),
    descripcion: String(payload.descripcion ?? '').trim(),
    categoria: String(payload.categoria ?? '').trim(),
    path_categoria: String(payload.path_categoria ?? '').trim(),
    subcategoria: String(payload.subcategoria ?? '').trim(),
    path_subcategoria: String(payload.path_subcategoria ?? '').trim(),
    ubicacion: String(payload.ubicacion ?? '').trim(),
    presupuesto: Number.isFinite(presupuestoValor) ? presupuestoValor : 0,
    fecha_limite: String(payload.fecha_limite ?? '').trim(),
    fotos,
    estado: 'publicado',
  };
}

function validarTrabajoSolicitado(trabajo: TrabajoSolicitudDocument): string | null {
  if (
    !trabajo.cliente_nombre ||
    !trabajo.cliente_email ||
    !trabajo.cliente_telefono ||
    !trabajo.titulo ||
    !trabajo.descripcion ||
    !trabajo.categoria ||
    !trabajo.path_categoria ||
    !trabajo.subcategoria ||
    !trabajo.path_subcategoria ||
    !trabajo.ubicacion
  ) {
    return 'Faltan datos obligatorios para publicar el trabajo';
  }

  const tamanoEstimadoFotos = Array.isArray(trabajo.fotos)
    ? trabajo.fotos.reduce((acumulado, foto) => acumulado + Math.ceil((foto.length * 3) / 4), 0)
    : 0;

  if (tamanoEstimadoFotos > TAMANO_MAXIMO_FOTOS_ESTIMADO) {
    return 'Las imágenes ocupan demasiado. Reduce el tamaño o sube menos fotos.';
  }

  return null;
}

async function obtenerClienteAutorizado(idCliente: string): Promise<{ _id: string; email: string } | null> {
  if (!mongoose.Types.ObjectId.isValid(idCliente)) {
    return null;
  }

  const cliente = await ClienteModel.findById(idCliente, { email: 1 }).lean();
  if (!cliente) {
    return null;
  }

  return {
    _id: String(idCliente),
    email: String(cliente.email ?? '').trim().toLowerCase(),
  };
}

function construirFiltroPropietarioTrabajo(idCliente: string, emailCliente: string): Record<string, unknown>[] {
  const filtros: Record<string, unknown>[] = [{ cliente_id: idCliente }];

  if (emailCliente.trim() !== '') {
    filtros.push({ cliente_email: emailCliente });
  }

  return filtros;
}

function escaparRegex(valor: string): string {
  return valor.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

async function generarAvisosParaPrestadores(trabajo: TrabajoSolicitudDocument, trabajoId: string): Promise<void> {
  const valoresBusqueda = [
    trabajo.path_subcategoria,
    trabajo.subcategoria,
    trabajo.path_categoria,
    trabajo.categoria,
  ].filter((valor) => typeof valor === 'string' && valor.trim() !== '');

  if (valoresBusqueda.length === 0) {
    return;
  }

  const filtrosPrestador: { [key: string]: unknown }[] = [];

  for (const valor of valoresBusqueda) {
    const valorLimpio = valor.trim();
    const regexValor = new RegExp(`^${escaparRegex(valorLimpio)}$`, 'i');

    filtrosPrestador.push(
      { categoria: valorLimpio },
      { subcategoria: valorLimpio },
      { tipo_servicio: valorLimpio },
      { categoria: regexValor },
      { subcategoria: regexValor },
      { tipo_servicio: regexValor },
    );
  }

  const prestadores = await ClienteModel.find(
    {
      es_prestador: true,
      $or: filtrosPrestador,
    },
    { _id: 1 }
  ).lean();

  if (prestadores.length === 0) {
    return;
  }

  const avisos = prestadores.map((prestador) => ({
    prestador_id: String(prestador._id),
    trabajo_id: trabajoId,
    trabajo_titulo: trabajo.titulo,
    trabajo_descripcion: trabajo.descripcion,
    categoria: trabajo.categoria,
    subcategoria: trabajo.subcategoria,
    ubicacion: trabajo.ubicacion,
    presupuesto: trabajo.presupuesto ?? 0,
    fecha_limite: trabajo.fecha_limite ?? '',
    foto_principal: trabajo.fotos[0] ?? '',
    leido: false,
  }));

  await AvisoModel.insertMany(avisos, { ordered: false });
}

routerTrabajos.get('/', async (_request: Request, response: Response) => {
  try {
    const trabajos = await TrabajoSolicitudModel.find().sort({ createdAt: -1 }).lean();
    response.status(200).json(trabajos);
  } catch (error) {
    console.error('Error obteniendo trabajos solicitados desde MongoDB:', error);
    response.status(500).json({ error: 'No se pudieron obtener los trabajos publicados' });
  }
});

routerTrabajos.get('/mis-trabajos', async (request: Request, response: Response) => {
  try {
    const idCliente = obtenerIdClienteDesdeToken(request.headers.authorization);

    if (!idCliente || !mongoose.Types.ObjectId.isValid(idCliente)) {
      response.status(401).json({ error: 'Token inválido o ausente' });
      return;
    }

    const cliente = await ClienteModel.findById(idCliente, { email: 1, trabajos_solicitados: 1 }).lean();

    if (!cliente) {
      response.status(404).json({ error: 'Cliente no encontrado' });
      return;
    }

    const trabajosSolicitadosIds = Array.isArray(cliente.trabajos_solicitados)
      ? cliente.trabajos_solicitados.filter((trabajoId): trabajoId is string => typeof trabajoId === 'string' && mongoose.Types.ObjectId.isValid(trabajoId))
      : [];

    const filtrosBusqueda: Record<string, unknown>[] = [
      { cliente_id: idCliente },
      { cliente_email: String(cliente.email ?? '').trim().toLowerCase() },
    ];

    if (trabajosSolicitadosIds.length > 0) {
      filtrosBusqueda.push({ _id: { $in: trabajosSolicitadosIds } });
    }

    const trabajos = await TrabajoSolicitudModel.find({
      $or: filtrosBusqueda,
    }).sort({ createdAt: -1 }).lean();

    response.status(200).json(trabajos);
  } catch (error) {
    console.error('Error obteniendo trabajos del cliente:', error);
    response.status(500).json({ error: 'No se pudieron obtener tus trabajos publicados' });
  }
});

routerTrabajos.get('/publico/:id', async (request: Request, response: Response) => {
  try {
    const idTrabajo = String(request.params.id ?? '').trim();

    if (!mongoose.Types.ObjectId.isValid(idTrabajo)) {
      response.status(400).json({ error: 'Identificador de trabajo invalido' });
      return;
    }

    const trabajo = await TrabajoSolicitudModel.findById(idTrabajo).lean();

    if (!trabajo) {
      response.status(404).json({ error: 'Trabajo no encontrado' });
      return;
    }

    response.status(200).json(trabajo);
  } catch (error) {
    console.error('Error obteniendo detalle publico del trabajo:', error);
    response.status(500).json({ error: 'No se pudo obtener el detalle del trabajo' });
  }
});

routerTrabajos.put('/:id/aceptar', async (request: Request, response: Response) => {
  try {
    const idTrabajo = String(request.params.id ?? '').trim();
    const idPrestador = obtenerIdClienteDesdeToken(request.headers.authorization);

    if (!idPrestador || !mongoose.Types.ObjectId.isValid(idPrestador)) {
      response.status(401).json({ error: 'Token invalido o ausente' });
      return;
    }

    if (!mongoose.Types.ObjectId.isValid(idTrabajo)) {
      response.status(400).json({ error: 'Identificador de trabajo invalido' });
      return;
    }

    const prestador = await ClienteModel.findById(
      idPrestador,
      { es_prestador: 1, nombre: 1, apellido: 1 }
    ).lean();

    if (!prestador) {
      response.status(404).json({ error: 'Prestador no encontrado' });
      return;
    }

    if (!prestador.es_prestador) {
      response.status(403).json({ error: 'Solo un prestador puede aceptar trabajos solicitados' });
      return;
    }

    const nombrePrestador = `${String(prestador.nombre ?? '').trim()} ${String(prestador.apellido ?? '').trim()}`.trim() || 'Un prestador';
    const fechaAceptacion = new Date().toISOString();

    const trabajoAceptado = await TrabajoSolicitudModel.findOneAndUpdate(
      {
        _id: idTrabajo,
        estado: { $ne: 'aceptado' },
      },
      {
        $set: {
          estado: 'aceptado',
          prestador_aceptado_id: idPrestador,
          prestador_aceptado_nombre: nombrePrestador,
          fecha_aceptacion: fechaAceptacion,
        },
      },
      { new: true }
    ).lean();

    if (!trabajoAceptado) {
      const trabajoActual = await TrabajoSolicitudModel.findById(idTrabajo).lean();

      if (!trabajoActual) {
        response.status(404).json({ error: 'Trabajo no encontrado' });
        return;
      }

      if (trabajoActual.estado === 'aceptado') {
        response.status(409).json({ error: 'Este trabajo ya fue aceptado por otro prestador' });
        return;
      }

      response.status(500).json({ error: 'No se pudo aceptar el trabajo' });
      return;
    }

    await AvisoModel.deleteMany({
      trabajo_id: idTrabajo,
      prestador_id: { $ne: idPrestador },
      tipo: 'trabajo',
    });

    await AvisoModel.updateOne(
      {
        prestador_id: idPrestador,
        trabajo_id: idTrabajo,
        tipo: 'trabajo',
      },
      {
        $set: {
          leido: true,
        },
      }
    );

    let idClienteDestino = String(trabajoAceptado.cliente_id ?? '').trim();

    if (!idClienteDestino && trabajoAceptado.cliente_email) {
      const clientePorEmail = await ClienteModel.findOne(
        { email: String(trabajoAceptado.cliente_email).trim().toLowerCase() },
        { _id: 1 }
      ).lean();

      if (clientePorEmail?._id) {
        idClienteDestino = String(clientePorEmail._id);
      }
    }

    if (idClienteDestino && mongoose.Types.ObjectId.isValid(idClienteDestino)) {
      await AvisoModel.findOneAndUpdate(
        {
          prestador_id: idClienteDestino,
          trabajo_id: idTrabajo,
          tipo: 'trabajo',
        },
        {
          $set: {
            trabajo_titulo: `Tu trabajo fue aceptado: ${trabajoAceptado.titulo}`,
            trabajo_descripcion: `${nombrePrestador} ha aceptado tu solicitud. Puedes contactar con el prestador para concretar los detalles.`,
            categoria: trabajoAceptado.categoria,
            subcategoria: trabajoAceptado.subcategoria,
            ubicacion: trabajoAceptado.ubicacion,
            presupuesto: trabajoAceptado.presupuesto ?? 0,
            fecha_limite: trabajoAceptado.fecha_limite ?? '',
            foto_principal: trabajoAceptado.fotos?.[0] ?? '',
            leido: false,
          },
          $setOnInsert: {
            prestador_id: idClienteDestino,
            trabajo_id: idTrabajo,
            tipo: 'trabajo',
          },
        },
        {
          upsert: true,
          new: true,
        }
      );
    }

    response.status(200).json({
      mensaje: 'Trabajo aceptado correctamente',
      trabajo: trabajoAceptado,
    });
  } catch (error) {
    console.error('Error aceptando trabajo solicitado:', error);
    response.status(500).json({ error: 'No se pudo aceptar el trabajo' });
  }
});

routerTrabajos.get('/:id', async (request: Request, response: Response) => {
  try {
    const idTrabajo = String(request.params.id ?? '').trim();
    const idCliente = obtenerIdClienteDesdeToken(request.headers.authorization);

    if (!idCliente || !mongoose.Types.ObjectId.isValid(idCliente)) {
      response.status(401).json({ error: 'Token inválido o ausente' });
      return;
    }

    if (!mongoose.Types.ObjectId.isValid(idTrabajo)) {
      response.status(400).json({ error: 'Identificador de trabajo inválido' });
      return;
    }

    const cliente = await obtenerClienteAutorizado(idCliente);

    if (!cliente) {
      response.status(404).json({ error: 'Cliente no encontrado' });
      return;
    }

    const trabajo = await TrabajoSolicitudModel.findOne({
      _id: idTrabajo,
      $or: construirFiltroPropietarioTrabajo(cliente._id, cliente.email),
    }).lean();

    if (!trabajo) {
      response.status(404).json({ error: 'Trabajo no encontrado' });
      return;
    }

    response.status(200).json(trabajo);
  } catch (error) {
    console.error('Error obteniendo trabajo solicitado:', error);
    response.status(500).json({ error: 'No se pudo obtener el trabajo solicitado' });
  }
});

routerTrabajos.post('/', async (request: Request, response: Response) => {
  try {
    const idClienteDesdeToken = obtenerIdClienteDesdeToken(request.headers.authorization);
    const payload = request.body as Record<string, unknown>;
    const nuevoTrabajo = normalizarTrabajoPayload(payload);

    if (idClienteDesdeToken && mongoose.Types.ObjectId.isValid(idClienteDesdeToken)) {
      nuevoTrabajo.cliente_id = idClienteDesdeToken;

      const cliente = await ClienteModel.findById(idClienteDesdeToken, { nombre: 1, email: 1, telefono: 1 }).lean();
      if (cliente) {
        nuevoTrabajo.cliente_nombre = String(cliente.nombre ?? nuevoTrabajo.cliente_nombre).trim();
        nuevoTrabajo.cliente_email = String(cliente.email ?? nuevoTrabajo.cliente_email).trim().toLowerCase();
        nuevoTrabajo.cliente_telefono = String(cliente.telefono ?? nuevoTrabajo.cliente_telefono).trim();
      }
    }

    const errorValidacion = validarTrabajoSolicitado(nuevoTrabajo);

    if (errorValidacion) {
      response.status(400).json({ error: errorValidacion });
      return;
    }

    const trabajoGuardado = await TrabajoSolicitudModel.create(nuevoTrabajo);

    if (idClienteDesdeToken && mongoose.Types.ObjectId.isValid(idClienteDesdeToken)) {
      try {
        await ClienteModel.updateOne(
          { _id: idClienteDesdeToken },
          {
            $addToSet: {
              trabajos_solicitados: String(trabajoGuardado._id),
            },
          }
        );
      } catch (errorCliente) {
        console.error('El trabajo se publicó, pero no se pudo enlazar en el cliente:', errorCliente);
      }
    }

    try {
      await generarAvisosParaPrestadores(nuevoTrabajo, String(trabajoGuardado._id));
    } catch (errorAvisos) {
      console.error('El trabajo se publicó, pero falló la generación de avisos:', errorAvisos);
    }

    response.status(201).json({
      mensaje: 'Trabajo publicado correctamente',
      trabajo: trabajoGuardado.toObject(),
    });
  } catch (error) {
    console.error('Error creando trabajo solicitado en MongoDB:', error);
    response.status(500).json({ error: 'No se pudo publicar el trabajo' });
  }
});

routerTrabajos.put('/:id', async (request: Request, response: Response) => {
  try {
    const idTrabajo = String(request.params.id ?? '').trim();
    const idClienteDesdeToken = obtenerIdClienteDesdeToken(request.headers.authorization);

    if (!idClienteDesdeToken || !mongoose.Types.ObjectId.isValid(idClienteDesdeToken)) {
      response.status(401).json({ error: 'Token inválido o ausente' });
      return;
    }

    if (!mongoose.Types.ObjectId.isValid(idTrabajo)) {
      response.status(400).json({ error: 'Identificador de trabajo inválido' });
      return;
    }

    const cliente = await obtenerClienteAutorizado(idClienteDesdeToken);

    if (!cliente) {
      response.status(404).json({ error: 'Cliente no encontrado' });
      return;
    }

    const trabajoExistente = await TrabajoSolicitudModel.findOne({
      _id: idTrabajo,
      $or: construirFiltroPropietarioTrabajo(cliente._id, cliente.email),
    });

    if (!trabajoExistente) {
      response.status(404).json({ error: 'Trabajo no encontrado' });
      return;
    }

    const payload = request.body as Record<string, unknown>;
    const trabajoActualizado = normalizarTrabajoPayload(payload);
    trabajoActualizado.cliente_id = cliente._id;
    trabajoActualizado.estado = trabajoExistente.estado || 'publicado';
    trabajoActualizado.prestador_aceptado_id = trabajoExistente.prestador_aceptado_id || '';
    trabajoActualizado.prestador_aceptado_nombre = trabajoExistente.prestador_aceptado_nombre || '';
    trabajoActualizado.fecha_aceptacion = trabajoExistente.fecha_aceptacion || '';

    const nombreCliente = String(payload.cliente_nombre ?? trabajoExistente.cliente_nombre ?? '').trim();
    const emailCliente = String(payload.cliente_email ?? cliente.email ?? trabajoExistente.cliente_email ?? '').trim().toLowerCase();
    const telefonoCliente = String(payload.cliente_telefono ?? trabajoExistente.cliente_telefono ?? '').trim();

    trabajoActualizado.cliente_nombre = nombreCliente || trabajoExistente.cliente_nombre;
    trabajoActualizado.cliente_email = emailCliente || trabajoExistente.cliente_email;
    trabajoActualizado.cliente_telefono = telefonoCliente || trabajoExistente.cliente_telefono;

    const errorValidacion = validarTrabajoSolicitado(trabajoActualizado);

    if (errorValidacion) {
      response.status(400).json({ error: errorValidacion });
      return;
    }

    const trabajoGuardado = await TrabajoSolicitudModel.findByIdAndUpdate(
      idTrabajo,
      {
        $set: trabajoActualizado,
      },
      { new: true }
    ).lean();

    if (!trabajoGuardado) {
      response.status(404).json({ error: 'Trabajo no encontrado' });
      return;
    }

    await AvisoModel.deleteMany({ trabajo_id: idTrabajo });

    try {
      await generarAvisosParaPrestadores(trabajoGuardado as TrabajoSolicitudDocument, idTrabajo);
    } catch (errorAvisos) {
      console.error('El trabajo se actualizó, pero falló la regeneración de avisos:', errorAvisos);
    }

    response.status(200).json({
      mensaje: 'Trabajo actualizado correctamente',
      trabajo: trabajoGuardado,
    });
  } catch (error) {
    console.error('Error actualizando trabajo solicitado:', error);
    response.status(500).json({ error: 'No se pudo actualizar el trabajo' });
  }
});

routerTrabajos.delete('/:id', async (request: Request, response: Response) => {
  try {
    const idTrabajo = String(request.params.id ?? '').trim();
    const idClienteDesdeToken = obtenerIdClienteDesdeToken(request.headers.authorization);

    if (!idClienteDesdeToken || !mongoose.Types.ObjectId.isValid(idClienteDesdeToken)) {
      response.status(401).json({ error: 'Token inválido o ausente' });
      return;
    }

    if (!mongoose.Types.ObjectId.isValid(idTrabajo)) {
      response.status(400).json({ error: 'Identificador de trabajo inválido' });
      return;
    }

    const cliente = await obtenerClienteAutorizado(idClienteDesdeToken);

    if (!cliente) {
      response.status(404).json({ error: 'Cliente no encontrado' });
      return;
    }

    const trabajoEliminable = await TrabajoSolicitudModel.findOneAndDelete({
      _id: idTrabajo,
      $or: construirFiltroPropietarioTrabajo(cliente._id, cliente.email),
    }).lean();

    if (!trabajoEliminable) {
      response.status(404).json({ error: 'Trabajo no encontrado' });
      return;
    }

    await ClienteModel.updateOne(
      { _id: idClienteDesdeToken },
      { $pull: { trabajos_solicitados: idTrabajo } }
    );

    await AvisoModel.deleteMany({ trabajo_id: idTrabajo });

    response.status(200).json({
      mensaje: 'Trabajo eliminado correctamente',
    });
  } catch (error) {
    console.error('Error eliminando trabajo solicitado:', error);
    response.status(500).json({ error: 'No se pudo eliminar el trabajo' });
  }
});

export default routerTrabajos;