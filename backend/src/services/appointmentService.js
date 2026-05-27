import prisma from '../config/prisma.js';

export const getAllAppointments = async ({ doctorId, status }) => {
  const where = {};
  if (doctorId) where.doctorId = doctorId;
  if (status) where.status = status;

  // Fetch appointments along with Patient and Doctor relations in a single database roundtrip (O(1) database joins)
  // This completely eliminates the N+1 performance query issue.
  const appointments = await prisma.appointment.findMany({
    where,
    include: {
      patient: {
        select: {
          id: true,
          name: true,
          phoneNumber: true,
          age: true,
          medicalHistory: true,
        },
      },
      doctor: {
        select: {
          id: true,
          name: true,
          specialization: true,
        },
      },
    },
    orderBy: { appointmentDate: 'asc' },
  });

  return appointments;
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
