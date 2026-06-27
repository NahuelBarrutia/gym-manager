import type { Request, Response } from 'express';
import { Usuario } from '../models/usuario.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  const usuario = await Usuario.findOne({ where: { email } });
  if (!usuario) {
    return res.status(404).json({ error: 'Usuario no encontrado' });
  }
  // Comparar contraseña con bcrypt
  const passwordValid = await bcrypt.compare(password, usuario.password);
  if (!passwordValid) {
    return res.status(401).json({ error: 'Contraseña incorrecta' });
  }
  // Generar token
  const token = jwt.sign({ id: usuario.id, email: usuario.email }, process.env.JWT_SECRET as string, { expiresIn: '7d' });
  res.json({ token, usuario: { id: usuario.id, nombre: usuario.nombre, email: usuario.email, rol: usuario.rol } });
};
