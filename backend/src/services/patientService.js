import prisma from '../config/prisma.js';

export const getAllPatients = async ({ search, gender, pageQuery, limitQuery }) => {
  // Inefficient: Retrieve all matching rows without take/skip limits from the database.
  // Scales poorly as patient directory grows. Preserved exactly.
  const allPatients = await prisma.patient.findMany({
    orderBy: { createdAt: 'desc' },
  });

  let filteredPatients = allPatients;

  // In-memory filter for search (checks name/phone/email)
  if (search) {
    const query = search.toLowerCase();
    filteredPatients = filteredPatients.filter(
      (p) =>
        p.name.toLowerCase().includes(query) ||
        p.phoneNumber.includes(query) ||
        (p.email && p.email.toLowerCase().includes(query))
    );
  }

  // In-memory filter for gender
  if (gender && gender !== 'All') {
    filteredPatients = filteredPatients.filter(
      (p) => p.gender && p.gender.toLowerCase() === gender.toLowerCase()
    );
  }

  // In-memory pagination setup
  const page = parseInt(pageQuery) || 1;
  const limit = parseInt(limitQuery) || 5;
  const offset = (page - 1) * limit;
  
  const paginatedResult = filteredPatients.slice(offset, offset + limit);
  const totalPages = Math.ceil(filteredPatients.length / limit);

  return {
    patients: paginatedResult,
    pagination: {
      page,
      limit,
      totalPatients: filteredPatients.length,
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
  // INCONSISTENT VALIDATION: Email nullable in schema, but only check missing fields here.
  // No regex to check telephone number formats. Preserved exactly.
  if (!name || !phoneNumber || !age || !gender) {
    throw new Error('Name, phoneNumber, age, and gender are required.');
  }

  const patient = await prisma.patient.create({
    data: {
      name,
      email: email || null,
      phoneNumber,
      age: parseInt(age),
      gender,
      medicalHistory: medicalHistory || null,
    },
  });

  return patient;
};

export const deletePatient = async (id) => {
  const patient = await prisma.patient.findUnique({ where: { id } });
  if (!patient) {
    throw new Error('Patient not found');
  }

  await prisma.patient.delete({ where: { id } });

  return patient.name;
};
