const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  try {
    // Create a category
    const kneeCategory = await prisma.category.create({
      data: {
        name: 'Knee',
        slug: 'knee',
        description: 'Conditions affecting the knee joint'
      }
    });

    console.log('Created category:', kneeCategory);

    // Create a bone joint school page
    const kneePainPage = await prisma.page.create({
      data: {
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

    // Create a second category
    const hipCategory = await prisma.category.create({
      data: {
        name: 'Hip',
        slug: 'hip',
        description: 'Conditions affecting the hip joint'
      }
    });

    console.log('Created category:', hipCategory);

    console.log('Seed completed successfully');
  } catch (error) {
    console.error('Error seeding data:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main(); 