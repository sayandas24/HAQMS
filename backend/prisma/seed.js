import { PrismaClient } from '@prisma/client';
import bcryptjs from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  try {
    // Clear existing data in correct dependency order
    await prisma.queueToken.deleteMany({});
    await prisma.appointment.deleteMany({});
    await prisma.patient.deleteMany({});
    await prisma.doctor.deleteMany({});
    await prisma.user.deleteMany({});

    console.log('✓ Cleared existing data');

    // Create login Users
    const hashedPassword = await bcryptjs.hash('password123', 10);

    const adminUser = await prisma.user.create({
      data: {
        email: 'admin@haqms.com',
        password: hashedPassword,
        name: 'System Administrator',
        role: 'ADMIN',
      },
    });

    const receptionistUser = await prisma.user.create({
      data: {
        email: 'reception1@haqms.com',
        password: hashedPassword,
        name: 'Reception Officer',
        role: 'RECEPTIONIST',
      },
    });

    const doctorUser = await prisma.user.create({
      data: {
        email: 'doctor1@haqms.com',
        password: hashedPassword,
        name: 'Dr. James Wilson',
        role: 'DOCTOR',
      },
    });

    console.log('✓ Created user accounts (admin@haqms.com, reception1@haqms.com, doctor1@haqms.com)');

    // Create Doctors (Linked with userId where appropriate, including stats fields)
    const doctor1 = await prisma.doctor.create({
      data: {
        name: 'Dr. James Wilson',
        specialization: 'Cardiology',
        department: 'Cardiology',
        consultationFee: 150.0,
        experience: 12,
        availableStartTime: '09:00',
        availableEndTime: '17:00',
        isActive: 1,
        userId: doctorUser.id, // Linking login account to doctor profile!
      },
    });

    const doctor2 = await prisma.doctor.create({
      data: {
        name: 'Dr. Sarah Johnson',
        specialization: 'Orthopedics',
        department: 'Surgery', // department matched for surgeons count aggregates
        consultationFee: 200.0,
        experience: 15,
        availableStartTime: '08:00',
        availableEndTime: '16:00',
        isActive: 1,
      },
    });

    const doctor3 = await prisma.doctor.create({
      data: {
        name: 'Dr. Michael Chen',
        specialization: 'Neurology',
        department: 'Neurology',
        consultationFee: 175.0,
        experience: 8,
        availableStartTime: '10:00',
        availableEndTime: '18:00',
        isActive: 1,
      },
    });

    console.log('✓ Created 3 doctors');

    // Create Patients
    const patient1 = await prisma.patient.create({
      data: {
        name: 'John Doe',
        phoneNumber: '555-0101',
        email: 'john.doe@email.com',
        age: 45,
        gender: 'Male',
        medicalHistory: 'Hypertension, managed with medication',
      },
    });

    const patient2 = await prisma.patient.create({
      data: {
        name: 'Jane Smith',
        phoneNumber: '555-0102',
        email: 'jane.smith@email.com',
        age: 32,
        gender: 'Female',
        medicalHistory: 'Diabetes Type 2',
      },
    });

    const patient3 = await prisma.patient.create({
      data: {
        name: 'Clark Kent',
        phoneNumber: '555-0103',
        email: 'clark.kent@email.com',
        age: 50,
        gender: 'Male',
        medicalHistory: null, // Left as null to verify application safety
      },
    });

    const patient4 = await prisma.patient.create({
      data: {
        name: 'Bruce Wayne',
        phoneNumber: '555-0104',
        email: 'bruce.wayne@email.com',
        age: 38,
        gender: 'Male',
        medicalHistory: null, // Left as null to verify application safety
      },
    });

    const patient5 = await prisma.patient.create({
      data: {
        name: 'Diana Prince',
        phoneNumber: '555-0105',
        email: 'diana.prince@email.com',
        age: 28,
        gender: 'Female',
        medicalHistory: 'No known allergies, good health',
      },
    });

    console.log('✓ Created 5 patients');

    // Create Appointments
    const today = new Date();
    const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);
    const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);

    const appt1 = await prisma.appointment.create({
      data: {
        patientId: patient1.id,
        doctorId: doctor1.id,
        appointmentDate: tomorrow,
        status: 'SCHEDULED',
        notes: 'Regular checkup',
        reason: 'Regular checkup',
      },
    });

    const appt2 = await prisma.appointment.create({
      data: {
        patientId: patient2.id,
        doctorId: doctor2.id,
        appointmentDate: nextWeek,
        status: 'SCHEDULED',
        notes: 'Follow-up consultation',
        reason: 'Follow-up consultation',
      },
    });

    const appt3 = await prisma.appointment.create({
      data: {
        patientId: patient3.id,
        doctorId: doctor3.id,
        appointmentDate: tomorrow,
        status: 'SCHEDULED',
        notes: 'Neurological assessment',
        reason: 'Neurological assessment',
      },
    });

    const appt4 = await prisma.appointment.create({
      data: {
        patientId: patient4.id,
        doctorId: doctor1.id,
        appointmentDate: nextWeek,
        status: 'COMPLETED',
        notes: 'Cardiac evaluation',
        reason: 'Cardiac evaluation',
      },
    });

    console.log('✓ Created 4 appointments');

    // Create Queue Tokens (for today's appointments)
    const token1 = await prisma.queueToken.create({
      data: {
        tokenNumber: 1,
        patientId: patient1.id,
        doctorId: doctor1.id,
        appointmentId: appt1.id,
        status: 'COMPLETED',
      },
    });

    const token2 = await prisma.queueToken.create({
      data: {
        tokenNumber: 2,
        patientId: patient3.id,
        doctorId: doctor3.id,
        appointmentId: appt3.id,
        status: 'WAITING',
      },
    });

    const token3 = await prisma.queueToken.create({
      data: {
        tokenNumber: 3,
        patientId: patient5.id,
        doctorId: doctor2.id,
        appointmentId: null,
        status: 'WAITING',
      },
    });

    console.log('✓ Created 3 queue tokens');

    console.log('\n✨ Database seeded successfully!');
    console.log('\n🔑 Pre-seeded Accounts (password: password123):');
    console.log('  - Admin: admin@haqms.com');
    console.log('  - Receptionist: reception1@haqms.com');
    console.log('  - Doctor: doctor1@haqms.com');

  } catch (error) {
    console.error('❌ Seed error:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
