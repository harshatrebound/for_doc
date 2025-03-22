import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  try {
    // Delete existing data in correct order (respect foreign key constraints)
    console.log('Cleaning up existing data...');
    await prisma.appointment.deleteMany();
    await prisma.doctorSchedule.deleteMany();
    await prisma.doctor.deleteMany();

    console.log('Creating doctors...');
    // Create doctors
    const drSameer = await prisma.doctor.upsert({
      where: { id: 'dr-sameer' },
      update: {},
      create: {
        id: 'dr-sameer',
        name: 'Dr. Sameer',
        speciality: 'Orthopedic Surgeon',
        fee: 700,
      },
    });

    const otherDoctors = await prisma.doctor.upsert({
      where: { id: 'other-doctors' },
      update: {},
      create: {
        id: 'other-doctors',
        name: 'Other Doctors',
        speciality: 'Sports Orthopedic Doctors',
        fee: 1000,
      },
    });

    console.log('Creating schedules...');
    // Create schedules for Dr. Sameer (Monday to Friday)
    for (let day = 1; day <= 5; day++) {
      await prisma.doctorSchedule.upsert({
        where: {
          id: `sch-${drSameer.id}-${day}`,
        },
        update: {},
        create: {
          id: `sch-${drSameer.id}-${day}`,
          doctorId: drSameer.id,
          dayOfWeek: day,
          startTime: '09:00',
          endTime: '17:00',
          isActive: true,
        },
      });
    }

    console.log('Seed completed successfully:', {
      drSameer,
      otherDoctors,
    });
  } catch (error) {
    console.error('Error during seeding:', error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error('Failed to seed database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 