import { Router } from 'express';
import {
  getPaquetes,
  getPaquete,
  createPaquete,
  updatePaquete,
  deletePaquete
} from '../controllers/paqueteController.js';

const router = Router();

router.get('/', getPaquetes);
router.get('/:id', getPaquete);
router.post('/', createPaquete);
router.put('/:id', updatePaquete);
router.delete('/:id', deletePaquete);

export default router;
