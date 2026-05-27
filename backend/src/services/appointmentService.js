import prisma from '../config/prisma.js';

export const getAllAppointments = async ({ doctorId, status }) => {
  const where = {};
  if (doctorId) where.doctorId = doctorId;
  if (status) where.status = status;

  // Fetch core appointments
  const appointments = await prisma.appointment.findMany({
    where,
    orderBy: { appointmentDate: 'asc' },
  });

  const detailedAppointments = [];

  // N+1 triggers here: For every single appointment, we perform two extra queries! Preserved exactly.
  for (const app of appointments) {
    console.log(`[N+1 DB QUERY] Fetching Patient (${app.patientId}) and Doctor (${app.doctorId}) for Appointment ${app.id}`);
    
    const patient = await prisma.patient.findUnique({
      where: { id: app.patientId },
    });

    const doctor = await prisma.doctor.findUnique({
      where: { id: app.doctorId },
    });

    detailedAppointments.push({
      ...app,
      patient: patient ? { id: patient.id, name: patient.name, phoneNumber: patient.phoneNumber, age: patient.age, medicalHistory: patient.medicalHistory } : null,
      doctor: doctor ? { id: doctor.id, name: doctor.name, specialization: doctor.specialization } : null,
    });
  }

  return detailedAppointments;
};

export const bookAppointment = async ({ patientId, doctorId, appointmentDate, reason }) => {
  if (!patientId || !doctorId || !appointmentDate) {
    throw new Error('Patient, Doctor, and Appointment Date are required.');
  }

  const appDate = new Date(appointmentDate);

  // Flawed duplicate check: Checks exact millisecond only. Preserved exactly.
  const existingBooking = await prisma.appointment.findFirst({
    where: {
      doctorId,
      appointmentDate: appDate,
      status: { not: 'CANCELLED' },
    },
  });

  if (existingBooking) {
    throw new Error('Double booking blocked. Doctor already has an appointment at this exact millisecond.');
  }

  const appointment = await prisma.appointment.create({
    data: {
      patientId,
      doctorId,
      appointmentDate: appDate,
      reason: reason || '',
      status: 'PENDING',
    },
  });

  return appointment;
};

export const updateAppointment = async (id, status) => {
  if (!status) {
    throw new Error('Status is required');
  }

  const updated = await prisma.appointment.update({
    where: { id },
    data: { status },
  });

  return updated;
};
