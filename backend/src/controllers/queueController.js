import * as queueService from '../services/queueService.js';

export const getActiveQueue = async (req, res, next) => {
  try {
    const { doctorId, status } = req.query;
    const tokens = await queueService.getActiveQueue({ doctorId, status });
    return res.json(tokens);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to retrieve queue', details: error.message });
  }
};

export const queueCheckin = async (req, res, next) => {
  try {
    const { patientId, doctorId, appointmentId } = req.body;
    const token = await queueService.queueCheckin({ patientId, doctorId, appointmentId });

    return res.status(201).json({
      message: 'Checked in successfully. Token generated.',
      token,
    });
  } catch (error) {
    if (error.message === 'Patient and Doctor ID are required for check-in.') {
      return res.status(400).json({ error: error.message });
    }
    console.error('Queue check-in error:', error);
    return res.status(500).json({ error: 'Check-in failed', details: error.message });
  }
};

export const updateQueueStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const updatedToken = await queueService.updateQueueStatus(req.params.id, status);
    return res.json(updatedToken);
  } catch (error) {
    if (error.message === 'Status is required') {
      return res.status(400).json({ error: error.message });
    }
    return res.status(500).json({ error: 'Failed to update queue token', details: error.message });
  }
};
