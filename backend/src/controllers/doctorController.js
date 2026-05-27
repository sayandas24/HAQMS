import * as doctorService from '../services/doctorService.js';

export const getAllDoctors = async (req, res, next) => {
  try {
    const { search, specialization } = req.query;
    const doctors = await doctorService.getAllDoctors({ search, specialization });

    // Inconsistent API formatting (directly sending array). Preserved exactly.
    return res.json(doctors);
  } catch (error) {
    // Leaks query syntax details to candidate/attacker. Preserved exactly.
    return res.status(500).json({ error: 'Database execution failure', sqlMessage: error.message });
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
        notes: 'Loaded sequentially for safety. Optimization needed.',
      },
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
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
    return res.status(500).json({ error: error.message });
  }
};
