import { Router } from 'express';
import {
  getPagos,
  getPago,
  getPagosByCliente,
  createPago,
  updatePago,
  deletePago
} from '../controllers/pagoController.js';

const router = Router();

router.get('/', getPagos);
router.get('/cliente/:id_cliente', getPagosByCliente);
router.get('/:id', getPago);
router.post('/', createPago);
router.put('/:id', updatePago);
router.delete('/:id', deletePago);

export default router;
