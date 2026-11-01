import express from 'express';
import upload from '../config/cloudinary.js';
import auth from '../middleware/auth.js';
import validate from '../middleware/validate.js';
import { idParams } from '../schemas/common.js';
import {
  createReportSchema,
  updateReportSchema,
  listReportsQuery
} from '../schemas/reportSchemas.js';
import {
  getReports,
  getReportById,
  createReport,
  updateReport,
  deleteReport
} from '../controllers/reportController.js';

const router = express.Router();

router.use(auth); // Apply auth middleware to all routes below

router.get('/', validate({ query: listReportsQuery }), getReports);
router.post('/', upload.single('image'), validate({ body: createReportSchema }), createReport);
router.get('/:id', validate({ params: idParams }), getReportById);
router.put('/:id', validate({ params: idParams, body: updateReportSchema }), updateReport);
router.delete('/:id', validate({ params: idParams }), deleteReport);

export default router;
