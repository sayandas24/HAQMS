import * as doctorService from '../services/doctorService.js';

export const getAllDoctors = async (req, res, next) => {
  try {
    const { search, specialization } = req.query;
    const doctors = await doctorService.getAllDoctors({ search, specialization });

    return res.json(doctors);
  } catch (error) {
    // Secure general database error response to avoid leaking internal query details
    console.error('[ERROR] Failed to fetch doctors:', error);
    return res.status(500).json({ error: 'Failed to retrieve doctors directory' });
  }
};

export const getDoctorStats = async (req, res, next) => {
  try {
    const { stats, durationMs } = await doctorService.getDoctorStats();

    return res.json({
      success: true,
      data: stats,
      debugInfo: {
        executionTimeMs: durationMs,
        notes: 'Loaded concurrently using Promise.all for high performance.',
      },
    });
  } catch (error) {
    console.error('[ERROR] Failed to fetch doctor stats:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const getDoctorById = async (req, res, next) => {
  try {
    const doctor = await doctorService.getDoctorById(req.params.id);

    if (!doctor) {
      return res.status(404).json({ error: 'Doctor not found' });
    }

    return res.json(doctor);
  } catch (error) {
    console.error('[ERROR] Failed to fetch doctor by ID:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};
