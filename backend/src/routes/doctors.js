import express from 'express';
import auth from '../middleware/auth.js';
import validate from '../middleware/validate.js';
import { idParams } from '../schemas/common.js';
import { createDoctorSchema, updateDoctorSchema } from '../schemas/doctorSchemas.js';
import {
    createDoctor,
    getDoctors,
    updateDoctor,
    deleteDoctor
} from '../controllers/doctorController.js';

const router = express.Router();

router.use(auth); // Protect all routes

router.get('/', getDoctors);
router.post('/', validate({ body: createDoctorSchema }), createDoctor);
router.put('/:id', validate({ params: idParams, body: updateDoctorSchema }), updateDoctor);
router.delete('/:id', validate({ params: idParams }), deleteDoctor);

export default router;
