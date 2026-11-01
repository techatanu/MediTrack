import express from 'express';
import auth from '../middleware/auth.js';
import validate from '../middleware/validate.js';
import { uploadReportFile } from '../middleware/upload.js';
import { idParams } from '../schemas/common.js';
import {
  createReportSchema,
  updateReportSchema,
  listReportsQuery
} from '../schemas/reportSchemas.js';
import {
  getReports,
  getReportById,
  getReportFile,
  createReport,
  updateReport,
  deleteReport
} from '../controllers/reportController.js';

const router = express.Router();

router.use(auth); // Apply auth middleware to all routes below

router.get('/', validate({ query: listReportsQuery }), getReports);
router.post('/', uploadReportFile, validate({ body: createReportSchema }), createReport);
router.get('/:id', validate({ params: idParams }), getReportById);
router.get('/:id/file', validate({ params: idParams }), getReportFile);
router.put('/:id', validate({ params: idParams, body: updateReportSchema }), updateReport);
router.delete('/:id', validate({ params: idParams }), deleteReport);

export default router;
