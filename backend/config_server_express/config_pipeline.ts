import express, { Express } from 'express';
import cors from 'cors';

export default function config_pipeline(app: Express): void {
  app.use(express.json({ limit: '25mb' }));
  app.use(express.urlencoded({ extended: true, limit: '25mb' }));
  app.use(cors());

  app.use((error: any, _request: express.Request, response: express.Response, next: express.NextFunction) => {
    if (error?.type === 'entity.too.large') {
      response.status(413).json({ error: 'Las fotos superan el tamaño permitido del formulario' });
      return;
    }

    next(error);
  });
}