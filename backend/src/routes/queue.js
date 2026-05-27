import express from 'express';
import * as queueController from '../controllers/queueController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.get('/', authenticate, queueController.getActiveQueue);
router.post('/checkin', authenticate, queueController.queueCheckin);
router.patch('/:id', authenticate, queueController.updateQueueStatus);

export default router;
