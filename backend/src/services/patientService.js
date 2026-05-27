import prisma from '../config/prisma.js';

export const getAllPatients = async ({ search, gender, pageQuery, limitQuery }) => {
  const page = parseInt(pageQuery) || 1;
  const limit = parseInt(limitQuery) || 5;
  const skip = (page - 1) * limit;

  const where = {};

  // Database-level search filtering using PostgreSQL indexes
  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { phoneNumber: { contains: search } },
      { email: { contains: search, mode: 'insensitive' } },
    ];
  }

  // Database-level gender filtering
  if (gender && gender !== 'All') {
    where.gender = {
      equals: gender,
      mode: 'insensitive',
    };
  }

  // Fetch paginated results and total filtered count in parallel to optimize event loop
  const [paginatedPatients, totalPatients] = await Promise.all([
    prisma.patient.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    }),
    prisma.patient.count({
      where,
    }),
  ]);

  const totalPages = Math.ceil(totalPatients / limit);

  return {
    patients: paginatedPatients,
    pagination: {
      page,
      limit,
      totalPatients,
      totalPages,
    },
  };
};

export const getPatientById = async (id) => {
  const patient = await prisma.patient.findUnique({
    where: { id },
    include: {
      appointments: true,
    },
  });

  return patient;
};

export const createPatient = async ({ name, email, phoneNumber, age, gender, medicalHistory }) => {
  // 1. Simple validation checks grouped together
  if (!name || !phoneNumber || !age || !gender) {
    throw new Error('Name, phoneNumber, age, and gender are required.');
  }

  const parsedAge = parseInt(age);
  if (isNaN(parsedAge) || parsedAge < 0 || parsedAge > 130) {
    throw new Error('Age must be a valid positive integer.');
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (email && email.trim() !== '' && !emailRegex.test(email.trim())) {
    throw new Error('Invalid email address format.');
  }

  const phoneRegex = /^\+?[0-9\s\-()]{7,20}$/;
  if (!phoneRegex.test(phoneNumber.trim())) {
    throw new Error('Invalid phone number format.');
  }

  // 2. Direct database creation inside try/catch.
  // PostgreSQL unique constraints automatically reject duplicates instantly
  try {
    return await prisma.patient.create({
      data: {
        name: name.trim(),
        email: email?.trim().toLowerCase() || null,
        phoneNumber: phoneNumber.trim(),
        age: parsedAge,
        gender,
        medicalHistory: medicalHistory || null,
      },
    });
  } catch (error) {
    // Intercept Prisma's Unique Constraint Violation error code (P2002)
    if (error.code === 'P2002') {
      const field = error.meta?.target?.[0] || 'phone number or email';
      throw new Error(`A patient with this ${field} is already registered.`);
    }
    throw error;
  }
};

export const deletePatient = async (id) => {
  const patient = await prisma.patient.findUnique({ where: { id } });
  if (!patient) {
    throw new Error('Patient not found');
  }

  await prisma.patient.delete({ where: { id } });

  return patient.name;
};
