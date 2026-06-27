import type { Request, Response } from 'express';
import { Paquete } from '../models/paquete';

export const getPaquetes = async (_req: Request, res: Response) => {
  const paquetes = await Paquete.findAll();
  res.json(paquetes);
};

export const getPaquete = async (req: Request, res: Response) => {
  const paquete = await Paquete.findByPk(req.params.id);
  if (!paquete) return res.status(404).json({ error: 'No encontrado' });
  res.json(paquete);
};

export const createPaquete = async (req: Request, res: Response) => {
  try {
    const paquete = await Paquete.create(req.body);
    res.status(201).json(paquete);
  } catch (error) {
    res.status(400).json({ error });
  }
};

export const updatePaquete = async (req: Request, res: Response) => {
  const paquete = await Paquete.findByPk(req.params.id);
  if (!paquete) return res.status(404).json({ error: 'No encontrado' });
  await paquete.update(req.body);
  res.json(paquete);
};

export const deletePaquete = async (req: Request, res: Response) => {
  const paquete = await Paquete.findByPk(req.params.id);
  if (!paquete) return res.status(404).json({ error: 'No encontrado' });
  await paquete.destroy();
  res.json({ message: 'Paquete eliminado' });
};
