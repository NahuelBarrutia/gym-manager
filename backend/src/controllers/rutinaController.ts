import type { Request, Response } from 'express';
import { Rutina } from '../models/rutina.js';

export const getRutinas = async (_req: Request, res: Response) => {
  const rutinas = await Rutina.findAll();
  res.json(rutinas);
};

export const getRutina = async (req: Request, res: Response) => {
  const rutina = await Rutina.findByPk(req.params.id);
  if (!rutina) return res.status(404).json({ error: 'No encontrado' });
  res.json(rutina);
};

export const createRutina = async (req: Request, res: Response) => {
  try {
    const rutina = await Rutina.create(req.body);
    res.status(201).json(rutina);
  } catch (error) {
    res.status(400).json({ error });
  }
};

export const updateRutina = async (req: Request, res: Response) => {
  const rutina = await Rutina.findByPk(req.params.id);
  if (!rutina) return res.status(404).json({ error: 'No encontrada' });
  await rutina.update(req.body);
  res.json(rutina);
};

export const deleteRutina = async (req: Request, res: Response) => {
  const rutina = await Rutina.findByPk(req.params.id);
  if (!rutina) return res.status(404).json({ error: 'No encontrada' });
  await rutina.destroy();
  res.json({ message: 'Rutina eliminada' });
};
