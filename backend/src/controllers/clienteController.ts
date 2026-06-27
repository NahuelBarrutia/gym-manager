import type { Request, Response } from 'express';
import { Cliente } from '../models/cliente.js';
import { Paquete } from '../models/paquete.js';
import { Rutina } from '../models/rutina.js';

const includes = [
  { model: Paquete, as: 'paquete' },
  { model: Rutina, as: 'rutina' },
];

export const getClientes = async (_req: Request, res: Response) => {
  const clientes = await Cliente.findAll({ include: includes });
  res.json(clientes);
};

export const getCliente = async (req: Request, res: Response) => {
  const cliente = await Cliente.findByPk(req.params.id, { include: includes });
  if (!cliente) return res.status(404).json({ error: 'No encontrado' });
  res.json(cliente);
};

export const createCliente = async (req: Request, res: Response) => {
  try {
    const cliente = await Cliente.create(req.body);
    res.status(201).json(cliente);
  } catch (error) {
    res.status(400).json({ error });
  }
};

export const updateCliente = async (req: Request, res: Response) => {
  const cliente = await Cliente.findByPk(req.params.id);
  if (!cliente) return res.status(404).json({ error: 'No encontrado' });
  await cliente.update(req.body);
  res.json(cliente);
};

export const deleteCliente = async (req: Request, res: Response) => {
  const cliente = await Cliente.findByPk(req.params.id);
  if (!cliente) return res.status(404).json({ error: 'No encontrado' });
  await cliente.destroy();
  res.json({ message: 'Cliente eliminado' });
};
