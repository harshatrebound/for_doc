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

    // Create a category
    const kneeCategory = await prisma.category.upsert({
      where: { name: 'Knee' },
      update: {},
      create: {
        name: 'Knee',
        slug: 'knee',
        description: 'Conditions affecting the knee joint'
      }
    });

    console.log('Created category:', kneeCategory);

    // Create a bone joint school page
    const kneePainPage = await prisma.page.upsert({
      where: { slug: 'understanding-knee-pain' },
      update: {},
      create: {
        title: 'Understanding Knee Pain',
        slug: 'understanding-knee-pain',
        pageType: 'bone-joint-school',
        summary: 'Learn about common causes of knee pain and treatment options',
        categoryId: kneeCategory.id,
        featuredImageUrl: '/images/knee-anatomy.jpg',
        readingTime: '5 min',
        contentBlocks: {
          create: [
            {
              type: 'heading',
              level: 2,
              text: 'Common Causes of Knee Pain',
              sortOrder: 0
            },
            {
              type: 'paragraph',
              text: 'Knee pain is a common complaint that affects people of all ages. It may be the result of an injury, such as a ruptured ligament or torn cartilage. Medical conditions including arthritis, gout and infections can also cause knee pain.',
              sortOrder: 1
            },
            {
              type: 'heading',
              level: 2,
              text: 'When to See a Doctor',
              sortOrder: 2
            },
            {
              type: 'paragraph',
              text: 'Call your doctor if you have severe pain, swelling, or cannot flex your knee. Also seek medical help if you cannot bear weight on your knee or feel as if your knee is unstable.',
              sortOrder: 3
            },
            {
              type: 'styled_list_item',
              icon: 'check',
              text: 'Swelling or redness around the joint',
              sortOrder: 4
            },
            {
              type: 'styled_list_item',
              icon: 'check',
              text: 'Inability to bear weight on the affected leg',
              sortOrder: 5
            },
            {
              type: 'styled_list_item',
              icon: 'check',
              text: 'Obvious deformity in your leg or knee',
              sortOrder: 6
            }
          ]
        }
      },
      include: {
        contentBlocks: true
      }
    });

    console.log('Created page:', kneePainPage);

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