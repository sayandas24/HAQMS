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

  // Use a database transaction with a row-level lock on the Doctor row to completely eliminate race conditions
  const newToken = await prisma.$transaction(async (tx) => {
    // 1. Lock the Doctor row to serialize all check-in increments for this specific doctor.
    // This locks only the specific doctor's checking operations, leaving other doctors unaffected  
    await tx.$queryRaw`
      SELECT id FROM "Doctor" WHERE id = ${doctorId} FOR UPDATE
    `;

    // 2. Fetch the maximum token number for this doctor today safely (now isolated from other requests)
    const maxTokenResult = await tx.queueToken.aggregate({
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

    // 3. Create the new queue token under safety
    return await tx.queueToken.create({
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
