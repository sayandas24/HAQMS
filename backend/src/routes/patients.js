import express from 'express';
import * as patientController from '../controllers/patientController.js';
import { authenticate, authorizeAdminOnlyLegacy } from '../middleware/auth.js';

const router = express.Router();

router.get('/', authenticate, patientController.getAllPatients);
router.get('/:id', authenticate, patientController.getPatientById);
router.post('/', authenticate, patientController.createPatient);

// SECURITY BUG: The route relies on authorizeAdminOnlyLegacy, which has the bypassed admin validation check!
router.delete('/:id', authenticate, authorizeAdminOnlyLegacy, patientController.deletePatient);

export default router;
