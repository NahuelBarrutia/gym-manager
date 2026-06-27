import type { Request, Response } from 'express';
import { Usuario } from '../models/usuario.js';
import bcrypt from 'bcrypt';

export const getUsuarios = async (_req: Request, res: Response) => {
  const usuarios = await Usuario.findAll();
  res.json(usuarios);
};

export const getUsuario = async (req: Request, res: Response) => {
  const usuario = await Usuario.findByPk(req.params.id);
  if (!usuario) return res.status(404).json({ error: 'No encontrado' });
  res.json(usuario);
};

export const createUsuario = async (req: Request, res: Response) => {
  try {
    let data = req.body;
    if (data.password) {
      const salt = await bcrypt.genSalt(10);
      data.password = await bcrypt.hash(data.password, salt);
    }
    const usuario = await Usuario.create(data);
    res.status(201).json(usuario);
  } catch (error) {
    res.status(400).json({ error });
  }
};

export const updateUsuario = async (req: Request, res: Response) => {
  const usuario = await Usuario.findByPk(req.params.id);
  if (!usuario) return res.status(404).json({ error: 'No encontrado' });
  await usuario.update(req.body);
  res.json(usuario);
};

export const deleteUsuario = async (req: Request, res: Response) => {
  const usuario = await Usuario.findByPk(req.params.id);
  if (!usuario) return res.status(404).json({ error: 'No encontrado' });
  await usuario.destroy();
  res.json({ message: 'Usuario eliminado' });
};
