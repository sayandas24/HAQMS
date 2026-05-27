import * as reportService from '../services/reportService.js';

export const getDoctorReports = async (req, res, next) => {
  try {
    const { reportData, durationMs } = await reportService.getDoctorReports();

    return res.json({
      success: true,
      timeTakenMs: durationMs,
      data: reportData,
    });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to generate report', details: error.message });
  }
};
