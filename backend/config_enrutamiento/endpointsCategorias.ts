import { Request, Response, Router } from 'express';
import CategoriaModel from '../modelos/CategoriaModel';

const routerCategorias = Router();

routerCategorias.get('/categorias', async (_request: Request, response: Response) => {
  try {
    const categorias = await CategoriaModel.find({}, { nombreCategoria: 1, pathCategoria: 1 }).lean();
    response.status(200).json(categorias);
  } catch (error) {
    console.error('Error obteniendo categorías desde MongoDB:', error);
    response.status(500).json({ error: 'No se pudieron obtener las categorías' });
  }
});

export default routerCategorias;
