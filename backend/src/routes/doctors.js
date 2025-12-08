import express from 'express';
import auth from '../middleware/auth.js';
import {
    createDoctor,
    getDoctors,
    updateDoctor,
    deleteDoctor
} from '../controllers/doctorController.js';

const router = express.Router();

router.use(auth); // Protect all routes

router.get('/', getDoctors);
router.post('/', createDoctor);
router.put('/:id', updateDoctor);
router.delete('/:id', deleteDoctor);

export default router;
