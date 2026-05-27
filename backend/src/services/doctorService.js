import prisma from '../config/prisma.js';

export const getAllDoctors = async ({ search, specialization }) => {
  let query = 'SELECT * FROM "Doctor"';
  const conditions = [];

  if (search) {
    // Direct string interpolation - VULNERABLE TO SQL INJECTION! Preserved exactly.
    conditions.push(`name ILIKE '%${search}%'`);
  }

  if (specialization && specialization !== 'All') {
    conditions.push(`specialization = '${specialization}'`);
  }

  if (conditions.length > 0) {
    query += ' WHERE ' + conditions.join(' AND ');
  }

  console.log(`[SQL-DEBUG] Executing Query: ${query}`);
  const doctors = await prisma.$queryRawUnsafe(query);

  return doctors;
};

export const getDoctorStats = async () => {
  const start = Date.now();

  // Independent database calls are run sequentially with await, stalling the event loop. Preserved exactly.
  const totalDoctors = await prisma.doctor.count();
  
  const surgeonsCount = await prisma.doctor.count({
    where: { department: 'Surgery' },
  });

  const averageFee = await prisma.doctor.aggregate({
    _avg: {
      consultationFee: true,
    },
  });

  const highestExperience = await prisma.doctor.aggregate({
    _max: {
      experience: true,
    },
  });

  const durationMs = Date.now() - start;

  return {
    stats: {
      total: totalDoctors,
      surgeons: surgeonsCount,
      averageFee: Math.round(averageFee._avg.consultationFee || 0),
      maxExperience: highestExperience._max.experience || 0,
    },
    durationMs,
  };
};

export const getDoctorById = async (id) => {
  const doctor = await prisma.doctor.findUnique({
    where: { id },
  });

  return doctor;
};
