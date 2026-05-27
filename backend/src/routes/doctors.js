import express from 'express';
import * as doctorController from '../controllers/doctorController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.get('/', authenticate, doctorController.getAllDoctors);
router.get('/stats', authenticate, doctorController.getDoctorStats);
router.get('/:id', authenticate, doctorController.getDoctorById);

export default router;
