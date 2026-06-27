import type { Request, Response } from 'express';
import { Pago } from '../models/pago';
import { Cliente } from '../models/cliente';
import { Paquete } from '../models/paquete';

const clienteConPaquete = { model: Cliente, as: 'cliente', include: [{ model: Paquete, as: 'paquete' }] };

export const getPagos = async (_req: Request, res: Response) => {
  const pagos = await Pago.findAll({ include: [clienteConPaquete] });
  res.json(pagos);
};

export const getPago = async (req: Request, res: Response) => {
  const pago = await Pago.findByPk(req.params.id, { include: [clienteConPaquete] });
  if (!pago) return res.status(404).json({ error: 'No encontrado' });
  res.json(pago);
};

export const getPagosByCliente = async (req: Request, res: Response) => {
  const pagos = await Pago.findAll({
    where: { id_cliente: req.params.id_cliente },
    include: [clienteConPaquete],
    order: [['fecha_pago', 'DESC']],
  });
  res.json(pagos);
};

export const createPago = async (req: Request, res: Response) => {
  try {
    const pago = await Pago.create(req.body);
    res.status(201).json(pago);
  } catch (error) {
    res.status(400).json({ error });
  }
};

export const updatePago = async (req: Request, res: Response) => {
  const pago = await Pago.findByPk(req.params.id);
  if (!pago) return res.status(404).json({ error: 'No encontrado' });
  await pago.update(req.body);
  res.json(pago);
};

export const deletePago = async (req: Request, res: Response) => {
  const pago = await Pago.findByPk(req.params.id);
  if (!pago) return res.status(404).json({ error: 'No encontrado' });
  await pago.destroy();
  res.json({ message: 'Pago eliminado' });
};
