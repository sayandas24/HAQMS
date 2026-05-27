import express from 'express';
import * as appointmentController from '../controllers/appointmentController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.get('/', authenticate, appointmentController.getAllAppointments);
router.post('/', authenticate, appointmentController.bookAppointment);
router.patch('/:id', authenticate, appointmentController.updateAppointment);

export default router;
