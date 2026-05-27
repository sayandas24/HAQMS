import prisma from '../config/prisma.js';

export const getDoctorReports = async () => {
  const start = Date.now();

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Eager load only the essential status/ids from appointments and queue tokens in a single optimized query roundtrip.
  // This completely eliminates the slow nested DB hits in a loop and avoids blocking the event loop.
  const doctors = await prisma.doctor.findMany({
    include: {
      appointments: {
        select: {
          status: true,
        },
      },
      queueTokens: {
        where: {
          createdAt: { gte: today },
        },
        select: {
          id: true,
        },
      },
    },
  });

  // Calculate aggregates in-memory, which is extremely fast for standard data sizes 
  const reportData = doctors.map((doc) => {
    const totalAppointments = doc.appointments.length;
    
    const completedAppointments = doc.appointments.filter(
      (a) => a.status === 'COMPLETED'
    ).length;

    const cancelledAppointments = doc.appointments.filter(
      (a) => a.status === 'CANCELLED'
    ).length;

    const todayQueueSize = doc.queueTokens.length;
    const revenue = completedAppointments * doc.consultationFee;

    return {
      id: doc.id,
      name: doc.name,
      specialization: doc.specialization,
      department: doc.department,
      totalAppointments,
      completedAppointments,
      cancelledAppointments,
      todayQueueSize,
      revenue,
    };
  });

  const durationMs = Date.now() - start;

  return {
    reportData,
    durationMs,
  };
};
