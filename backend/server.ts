import 'dotenv/config';
import express from 'express';
import mongoose from 'mongoose';
import config_pipeline from './config_server_express/config_pipeline';
import configurarEnrutamiento from './config_enrutamiento/config_enrutamiento';
import JwtService from './servicios/JwtService';

const app = express();
config_pipeline(app);
configurarEnrutamiento(app);

async function startServer(): Promise<void> {
  const mongoUrl = process.env.URL_MONGODB;

  if (!mongoUrl) {
    throw new Error('La variable URL_MONGODB no está configurada en backend/.env');
  }

  const testToken = JwtService.generarJWT({ service: 'startup-check' }, '10m', false);
  if (testToken.length === 0) {
    throw new Error('No se pudo inicializar JwtService: revisa JWT_SECRET en backend/.env');
  }

  await mongoose.connect(mongoUrl);
  console.log('...Conectado a MongoDB...');

  app.listen(3000, (error?: any) => {
    if (error) {
      console.log('Error al INICIAR servidor WEB EXPRESS en puerto 3000:', error);
    } else {
      console.log('...Servidor WEB EXPRESS iniciado en puerto 3000...');
    }
  });
}

void startServer().catch((error) => {
  console.error('Error inicializando backend:', error);
  process.exit(1);
});
