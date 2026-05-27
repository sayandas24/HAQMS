import * as appointmentService from '../services/appointmentService.js';

export const getAllAppointments = async (req, res, next) => {
  try {
    const { doctorId, status } = req.query;
    const appointments = await appointmentService.getAllAppointments({ doctorId, status });

    return res.json({
      success: true,
      count: appointments.length,
      appointments: appointments,
    });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to retrieve appointments', details: error.message });
  }
};

export const bookAppointment = async (req, res, next) => {
  try {
    const { patientId, doctorId, appointmentDate, reason } = req.body;
    const appointment = await appointmentService.bookAppointment({
      patientId,
      doctorId,
      appointmentDate,
      reason,
    });

    return res.status(201).json({
      message: 'Appointment booked successfully',
      appointment,
    });
  } catch (error) {
    if (error.message === 'Patient, Doctor, and Appointment Date are required.') {
      return res.status(400).json({ error: error.message });
    }
    if (error.message.startsWith('Double booking blocked')) {
      return res.status(400).json({ error: error.message });
    }
    return res.status(500).json({ error: 'Failed to book appointment', details: error.message });
  }
};

export const updateAppointment = async (req, res, next) => {
  try {
    const { status } = req.body;
    const updated = await appointmentService.updateAppointment(req.params.id, status);

    return res.json(updated);
  } catch (error) {
    if (error.message === 'Status is required') {
      return res.status(400).json({ error: error.message });
    }
    return res.status(500).json({ error: 'Failed to update appointment', details: error.message });
  }
};
