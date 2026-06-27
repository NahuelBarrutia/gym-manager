import { Router } from 'express';
import {
  getRutinas,
  getRutina,
  createRutina,
  updateRutina,
  deleteRutina
} from '../controllers/rutinaController.js';

const router = Router();

router.get('/', getRutinas);
router.get('/:id', getRutina);
router.post('/', createRutina);
router.put('/:id', updateRutina);
router.delete('/:id', deleteRutina);

export default router;
