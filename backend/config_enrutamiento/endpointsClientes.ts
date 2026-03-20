import { Request, Response, Router } from 'express';
import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import ClienteModel, { ClienteDocument } from '../modelos/ClienteModel';
import JwtService from '../servicios/JwtService';

const routerCliente = Router();
const BCRYPT_SALT_ROUNDS = 10;
const JWT_EXPIRATION = '12h';
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/;

function normalizarClientePayload(payload: Record<string, unknown>): ClienteDocument {
  const contrasena = typeof payload['contraseña'] === 'string' ? payload['contraseña'] : '';
  const costeHora = typeof payload.coste_hora === 'number'
    ? payload.coste_hora
    : Number(payload.coste_hora ?? 0);

  return {
    nombre: String(payload.nombre ?? '').trim(),
    apellido: String(payload.apellido ?? '').trim(),
    telefono: String(payload.telefono ?? '').trim(),
    email: String(payload.email ?? '').trim().toLowerCase(),
    contrasena,
    direccion: String(payload.direccion ?? '').trim(),
    descripcion: String(payload.descripcion ?? '').trim(),
    es_prestador: Boolean(payload.es_prestador),
    tipo_servicio: String(payload.tipo_servicio ?? '').trim(),
    categoria: String(payload.categoria ?? '').trim(),
    subcategoria: String(payload.subcategoria ?? '').trim(),
    descripcion_servicio: String(payload.descripcion_servicio ?? '').trim(),
    ubicacion_servicio: String(payload.ubicacion_servicio ?? '').trim(),
    direccion_servicio: String(payload.direccion_servicio ?? '').trim(),
    coste_hora: Number.isFinite(costeHora) ? costeHora : 0,
  };
}

function validarCliente(cliente: ClienteDocument): string | null {
  if (!cliente.nombre || !cliente.apellido || !cliente.telefono || !cliente.email || !cliente.contrasena || !cliente.direccion) {
    return 'Faltan datos obligatorios para el registro';
  }

  if (!PASSWORD_REGEX.test(cliente.contrasena)) {
    return 'La contraseña debe tener al menos 8 caracteres, mayúscula, minúscula, número y símbolo';
  }

  return null;
}

function clienteSinContrasena(cliente: Record<string, unknown>): Record<string, unknown> {
  const { contrasena: _contrasena, ...clienteSinPassword } = cliente;
  return clienteSinPassword;
}

function esHashBcrypt(valor: string): boolean {
  return /^\$2[aby]\$\d{2}\$/.test(valor);
}

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

function sanitizarCamposEditables(payload: Record<string, unknown>): Partial<ClienteDocument> {
  const clienteEditable: Partial<ClienteDocument> = {};

  if (typeof payload.nombre === 'string') {
    clienteEditable.nombre = payload.nombre.trim();
  }

  if (typeof payload.apellido === 'string') {
    clienteEditable.apellido = payload.apellido.trim();
  }

  if (typeof payload.telefono === 'string') {
    clienteEditable.telefono = payload.telefono.trim();
  }

  if (typeof payload.email === 'string') {
    clienteEditable.email = payload.email.trim().toLowerCase();
  }

  if (typeof payload.direccion === 'string') {
    clienteEditable.direccion = payload.direccion.trim();
  }

  if (typeof payload.descripcion === 'string') {
    clienteEditable.descripcion = payload.descripcion.trim();
  }

  if (typeof payload.es_prestador === 'boolean') {
    clienteEditable.es_prestador = payload.es_prestador;
  }

  if (typeof payload.tipo_servicio === 'string') {
    clienteEditable.tipo_servicio = payload.tipo_servicio.trim();
  }

  if (typeof payload.categoria === 'string') {
    clienteEditable.categoria = payload.categoria.trim();
  }

  if (typeof payload.subcategoria === 'string') {
    clienteEditable.subcategoria = payload.subcategoria.trim();
  }

  if (typeof payload.descripcion_servicio === 'string') {
    clienteEditable.descripcion_servicio = payload.descripcion_servicio.trim();
  }

  if (typeof payload.ubicacion_servicio === 'string') {
    clienteEditable.ubicacion_servicio = payload.ubicacion_servicio.trim();
  }

  if (typeof payload.direccion_servicio === 'string') {
    clienteEditable.direccion_servicio = payload.direccion_servicio.trim();
  }

  if (typeof payload.coste_hora === 'number') {
    clienteEditable.coste_hora = payload.coste_hora;
  }

  if (typeof payload.coste_hora === 'string') {
    const costeHora = Number(payload.coste_hora);
    if (Number.isFinite(costeHora)) {
      clienteEditable.coste_hora = costeHora;
    }
  }

  return clienteEditable;
}

routerCliente.post('/registro', async (request: Request, response: Response) => {
  try {
    const nuevoCliente = normalizarClientePayload(request.body as Record<string, unknown>);
    const errorValidacion = validarCliente(nuevoCliente);

    if (errorValidacion) {
      response.status(400).json({ error: errorValidacion });
      return;
    }

    const clienteExistente = await ClienteModel.findOne({ email: nuevoCliente.email }).lean();

    if (clienteExistente) {
      response.status(409).json({ error: 'Ya existe una cuenta con este email' });
      return;
    }

    nuevoCliente.contrasena = await bcrypt.hash(nuevoCliente.contrasena, BCRYPT_SALT_ROUNDS);

    const clienteGuardado = await ClienteModel.create(nuevoCliente);
    const clienteSinPassword = clienteSinContrasena(clienteGuardado.toObject());

    const tokens = JwtService.generarJWT(
      { email: clienteGuardado.email, idCliente: clienteGuardado._id },
      JWT_EXPIRATION,
      false,
      { subject: String(clienteGuardado._id) }
    );

    if (tokens.length === 0) {
      response.status(500).json({ error: 'No se pudo generar el token de sesión' });
      return;
    }

    response.status(201).json({ cliente: clienteSinPassword, token: tokens[0] });
  } catch (error) {
    console.error('Error registrando cliente en MongoDB:', error);
    response.status(500).json({ error: 'No se pudo registrar el cliente' });
  }
});

routerCliente.post('/login', async (request: Request, response: Response) => {
  try {
    const email = String(request.body?.email ?? '').trim().toLowerCase();
    const contrasena = String(request.body?.contrasena ?? '');

    if (!email || !contrasena) {
      response.status(400).json({ error: 'Email y contraseña son obligatorios' });
      return;
    }

    const cliente = await ClienteModel.findOne({ email }).lean();

    if (!cliente) {
      response.status(401).json({ error: 'Credenciales incorrectas' });
      return;
    }

    let credencialesValidas = false;

    if (esHashBcrypt(cliente.contrasena)) {
      credencialesValidas = await bcrypt.compare(contrasena, cliente.contrasena);
    } else {
      credencialesValidas = cliente.contrasena === contrasena;

      if (credencialesValidas) {
        const hashActualizado = await bcrypt.hash(contrasena, BCRYPT_SALT_ROUNDS);
        await ClienteModel.updateOne({ _id: cliente._id }, { $set: { contrasena: hashActualizado } });
      }
    }

    if (!credencialesValidas) {
      response.status(401).json({ error: 'Credenciales incorrectas' });
      return;
    }

    const tokens = JwtService.generarJWT(
      { email: cliente.email, idCliente: cliente._id },
      JWT_EXPIRATION,
      false,
      { subject: String(cliente._id) }
    );

    if (tokens.length === 0) {
      response.status(500).json({ error: 'No se pudo generar el token de sesión' });
      return;
    }

    response.status(200).json({
      cliente: clienteSinContrasena(cliente as unknown as Record<string, unknown>),
      token: tokens[0],
    });
  } catch (error) {
    console.error('Error iniciando sesión de cliente:', error);
    response.status(500).json({ error: 'No se pudo iniciar sesión' });
  }
});

routerCliente.get('/perfil', async (request: Request, response: Response) => {
  try {
    const idCliente = obtenerIdClienteDesdeToken(request.headers.authorization);

    if (!idCliente || !mongoose.Types.ObjectId.isValid(idCliente)) {
      response.status(401).json({ error: 'Token inválido o ausente' });
      return;
    }

    const cliente = await ClienteModel.findById(idCliente).lean();

    if (!cliente) {
      response.status(404).json({ error: 'Cliente no encontrado' });
      return;
    }

    response.status(200).json(clienteSinContrasena(cliente as unknown as Record<string, unknown>));
  } catch (error) {
    console.error('Error obteniendo perfil desde JWT:', error);
    response.status(500).json({ error: 'No se pudo obtener el perfil del cliente' });
  }
});

routerCliente.put('/perfil', async (request: Request, response: Response) => {
  try {
    const idCliente = obtenerIdClienteDesdeToken(request.headers.authorization);

    if (!idCliente || !mongoose.Types.ObjectId.isValid(idCliente)) {
      response.status(401).json({ error: 'Token inválido o ausente' });
      return;
    }

    const camposActualizables = sanitizarCamposEditables(request.body as Record<string, unknown>);

    if (Object.keys(camposActualizables).length === 0) {
      response.status(400).json({ error: 'No hay campos válidos para actualizar' });
      return;
    }

    if (camposActualizables.email) {
      const clienteConMismoEmail = await ClienteModel.findOne({
        email: camposActualizables.email,
        _id: { $ne: idCliente },
      }).lean();

      if (clienteConMismoEmail) {
        response.status(409).json({ error: 'Ya existe una cuenta con este email' });
        return;
      }
    }

    if (camposActualizables.es_prestador === false) {
      camposActualizables.tipo_servicio = '';
      camposActualizables.categoria = '';
      camposActualizables.subcategoria = '';
      camposActualizables.descripcion_servicio = '';
      camposActualizables.ubicacion_servicio = '';
      camposActualizables.direccion_servicio = '';
      camposActualizables.coste_hora = 0;
    }

    const clienteActualizado = await ClienteModel.findByIdAndUpdate(
      idCliente,
      { $set: camposActualizables },
      { new: true }
    ).lean();

    if (!clienteActualizado) {
      response.status(404).json({ error: 'Cliente no encontrado' });
      return;
    }

    response.status(200).json(clienteSinContrasena(clienteActualizado as unknown as Record<string, unknown>));
  } catch (error) {
    console.error('Error actualizando perfil de cliente:', error);
    response.status(500).json({ error: 'No se pudo actualizar el perfil del cliente' });
  }
});

routerCliente.get('/:id', async (request: Request, response: Response) => {
  try {
    const id = String(request.params.id ?? '');

    if (!mongoose.Types.ObjectId.isValid(id)) {
      response.status(400).json({ error: 'Identificador de cliente inválido' });
      return;
    }

    const cliente = await ClienteModel.findById(id).lean();

    if (!cliente) {
      response.status(404).json({ error: 'Cliente no encontrado' });
      return;
    }

    response.status(200).json(clienteSinContrasena(cliente as unknown as Record<string, unknown>));
  } catch (error) {
    console.error('Error obteniendo perfil de cliente:', error);
    response.status(500).json({ error: 'No se pudo obtener el perfil del cliente' });
  }
});

export default routerCliente;
