import prisma from '../config/prisma.js';

export const getActiveQueue = async ({ doctorId, status }) => {
  const where = {};
  if (doctorId) where.doctorId = doctorId;
  if (status) where.status = status;

  const tokens = await prisma.queueToken.findMany({
    where,
    include: {
      patient: true,
      doctor: true,
    },
    orderBy: { createdAt: 'asc' },
  });

  return tokens;
};

export const queueCheckin = async ({ patientId, doctorId, appointmentId }) => {
  if (!patientId || !doctorId) {
    throw new Error('Patient and Doctor ID are required for check-in.');
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // 1. Fetch current maximum token number for this doctor today
  const maxTokenResult = await prisma.queueToken.aggregate({
    where: {
      doctorId,
      createdAt: { gte: today },
    },
    _max: {
      tokenNumber: true,
    },
  });

  const currentMax = maxTokenResult._max.tokenNumber || 0;
  const nextTokenNumber = currentMax + 1;

  // PERFORMANCE/CONCURRENCY BUG: Artificial sleep to widen the race condition window. Preserved exactly.
  await new Promise((resolve) => setTimeout(resolve, 350));

  // 2. Insert new token
  const newToken = await prisma.queueToken.create({
    data: {
      tokenNumber: nextTokenNumber,
      patientId,
      doctorId,
      appointmentId: appointmentId || null,
      status: 'WAITING',
    },
    include: {
      patient: true,
      doctor: true,
    },
  });

  return newToken;
};

export const updateQueueStatus = async (id, status) => {
  if (!status) {
    throw new Error('Status is required');
  }

  const updatedToken = await prisma.queueToken.update({
    where: { id },
    data: { status },
    include: {
      patient: true,
      doctor: true,
    },
  });

  return updatedToken;
};
