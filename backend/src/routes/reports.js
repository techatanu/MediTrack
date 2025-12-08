import express from 'express';
import upload from '../config/cloudinary.js';
import auth from '../middleware/auth.js';
import {
  getReports,
  getReportById,
  createReport,
  updateReport,
  deleteReport
} from '../controllers/reportController.js';

const router = express.Router();

// Public routes (none for now)

// Protected routes
router.use(auth); // Apply auth middleware to all routes below

router.get('/', getReports);
router.post('/', upload.single('image'), createReport);
router.get('/:id', getReportById);
router.put('/:id', updateReport);
router.delete('/:id', deleteReport);

export default router;