import express, { Express } from 'express';
import cors from 'cors';

export default function config_pipeline(app: Express): void {
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(cors());
}