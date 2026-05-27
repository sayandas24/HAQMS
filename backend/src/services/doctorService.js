import prisma from '../config/prisma.js';

export const getAllDoctors = async ({ search, specialization }) => {
  const where = {};

  if (search) {
    where.name = {
      contains: search,
      mode: 'insensitive',
    };
  }

  if (specialization && specialization !== 'All') {
    where.specialization = specialization;
  }

  // Type-safe Prisma findMany query protects against SQL injection
  const doctors = await prisma.doctor.findMany({
    where,
  });

  return doctors;
};

export const getDoctorStats = async () => {
  const start = Date.now();

  // Run database calls in parallel using Promise.all to prevent stalling the Node.js event loop
  const [totalDoctors, surgeonsCount, averageFee, highestExperience] = await Promise.all([
    prisma.doctor.count(),
    prisma.doctor.count({
      where: { department: 'Surgery' },
    }),
    prisma.doctor.aggregate({
      _avg: {
        consultationFee: true,
      },
    }),
    prisma.doctor.aggregate({
      _max: {
        experience: true,
      },
    }),
  ]);

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
