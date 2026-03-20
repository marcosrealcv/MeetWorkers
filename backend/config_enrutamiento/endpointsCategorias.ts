import { Request, Response, Router } from 'express';
import CategoriaModel from '../modelos/CategoriaModel';
import ClienteModel from '../modelos/ClienteModel';

const routerCategorias = Router();

// Obtener solo categorías principales (pathCategoria de 1 dígito)
routerCategorias.get('/categorias', async (_request: Request, response: Response) => {
  try {
    const categorias = await CategoriaModel.find(
      { pathCategoria: /^\d+$/ }, // Solo números simples (1, 2, 3, etc.)
      { nombreCategoria: 1, pathCategoria: 1 }
    ).lean();
    response.status(200).json(categorias);
  } catch (error) {
    console.error('Error obteniendo categorías desde MongoDB:', error);
    response.status(500).json({ error: 'No se pudieron obtener las categorías' });
  }
});

// Obtener subcategorías por categoría principal
routerCategorias.get('/subcategorias/:pathCategoria', async (request: Request, response: Response) => {
  try {
    const { pathCategoria } = request.params;
    const subcategorias = await CategoriaModel.find(
      { pathCategoria: new RegExp(`^${pathCategoria}-`) }, // Ej: 1-, 2-, etc.
      { nombreCategoria: 1, pathCategoria: 1 }
    ).lean();
    response.status(200).json(subcategorias);
  } catch (error) {
    console.error('Error obteniendo subcategorías desde MongoDB:', error);
    response.status(500).json({ error: 'No se pudieron obtener las subcategorías' });
  }
});

// Obtener prestadores por subcategoría
routerCategorias.get('/prestadores-categoria/:pathCategoria', async (request: Request, response: Response) => {
  try {
    const pathCategoria = request.params.pathCategoria;
    if (typeof pathCategoria !== 'string') {
      response.status(400).json({ error: 'La subcategoria indicada no es valida' });
      return;
    }

    const subcategoria = await CategoriaModel.findOne(
      { pathCategoria },
      { nombreCategoria: 1 }
    ).lean();

    const nombreSubcategoria = typeof subcategoria?.nombreCategoria === 'string'
      ? subcategoria.nombreCategoria.trim()
      : '';

    const filtroSubcategoria: { [key: string]: unknown }[] = [
      { subcategoria: pathCategoria },
      { categoria: pathCategoria },
      { tipo_servicio: pathCategoria },
    ];

    if (nombreSubcategoria) {
      const nombreSubcategoriaEscapado = nombreSubcategoria.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regexNombreSubcategoria = new RegExp(`^${nombreSubcategoriaEscapado}$`, 'i');

      filtroSubcategoria.push(
        { subcategoria: regexNombreSubcategoria },
        { categoria: regexNombreSubcategoria },
        { tipo_servicio: regexNombreSubcategoria }
      );
    }

    const prestadores = await ClienteModel.find(
      {
        es_prestador: true,
        $or: filtroSubcategoria,
      },
      { 
        nombre: 1, 
        apellido: 1, 
        descripcion_servicio: 1, 
        coste_hora: 1, 
        subcategoria: 1,
        categoria: 1 
      }
    ).lean();
    response.status(200).json(prestadores);
  } catch (error) {
    console.error('Error obteniendo prestadores desde MongoDB:', error);
    response.status(500).json({ error: 'No se pudieron obtener los prestadores' });
  }
});

// Obtener todos los prestadores activos
routerCategorias.get('/prestadores', async (_request: Request, response: Response) => {
  try {
    const prestadores = await ClienteModel.find(
      { es_prestador: true },
      { 
        nombre: 1, 
        apellido: 1, 
        descripcion_servicio: 1, 
        coste_hora: 1, 
        subcategoria: 1,
        categoria: 1 
      }
    ).lean();
    response.status(200).json(prestadores);
  } catch (error) {
    console.error('Error obteniendo prestadores desde MongoDB:', error);
    response.status(500).json({ error: 'No se pudieron obtener los prestadores' });
  }
});

export default routerCategorias;
