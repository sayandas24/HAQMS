import prisma from './src/config/prisma.js';
import { queueCheckin } from './src/services/queueService.js';

async function testConcurrency() {
  console.log('🧪 Starting Concurrency Race Condition Test...');

  try {
    // 1. Fetch our pre-seeded Cardiology doctor and a set of patients
    const doctor = await prisma.doctor.findFirst({
      where: { name: 'Dr. James Wilson' }
    });

    const patients = await prisma.patient.findMany({
      take: 3
    });

    if (!doctor || patients.length < 3) {
      console.error('❌ Missing seeded database records. Please run db:setup first.');
      return;
    }

    console.log(`👨‍⚕️ Target Doctor: ${doctor.name} (${doctor.id})`);
    console.log(`👥 Target Patients: ${patients.map(p => p.name).join(', ')}`);

    // Clear any existing queue tokens for Dr. James Wilson today to get a clean baseline
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    await prisma.queueToken.deleteMany({
      where: {
        doctorId: doctor.id,
        createdAt: { gte: today }
      }
    });
    console.log('✓ Cleaned today\'s queue tokens for baseline accuracy');

    // 2. Fire 3 concurrent check-ins at the exact same time
    console.log('\n🚀 Dispatching 3 concurrent check-ins in parallel (Promise.all)...');
    
    const results = await Promise.allSettled([
      queueCheckin({ patientId: patients[0].id, doctorId: doctor.id }),
      queueCheckin({ patientId: patients[1].id, doctorId: doctor.id }),
      queueCheckin({ patientId: patients[2].id, doctorId: doctor.id })
    ]);

    // 3. Inspect results and assert token uniqueness
    const generatedTokens = [];
    results.forEach((res, index) => {
      if (res.status === 'fulfilled') {
        const token = res.value;
        generatedTokens.push(token.tokenNumber);
        console.log(`✅ Request #${index + 1} completed: Patient "${token.patient.name}" allocated Token #${token.tokenNumber}`);
      } else {
        console.error(`❌ Request #${index + 1} failed:`, res.reason.message);
      }
    });

    console.log('\n📊 Results Analysis:');
    console.log(`Generated Token Numbers: [${generatedTokens.sort().join(', ')}]`);

    // Check for duplicates
    const uniqueTokens = new Set(generatedTokens);
    if (uniqueTokens.size === generatedTokens.length && generatedTokens.length === 3) {
      console.log('🎉 SUCCESS: No duplicate token numbers allocated! Row-level locking transaction verified.');
    } else {
      console.error('💥 FAILURE: Duplicate token numbers detected or some requests failed! Concurrency check failed.');
    }

  } catch (error) {
    console.error('❌ Test failed with error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testConcurrency();
