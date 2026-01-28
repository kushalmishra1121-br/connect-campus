const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const categories = [
        { name: 'Facilities', department_email: 'facilities@university.edu' },
        { name: 'IT Support', department_email: 'itsupport@university.edu' },
        { name: 'Academic', department_email: 'academic@university.edu' },
        { name: 'Housing', department_email: 'housing@university.edu' },
        { name: 'Library', department_email: 'library@university.edu' },
        { name: 'Administrative', department_email: 'admin@university.edu' },
        { name: 'Safety', department_email: 'security@university.edu' },
        { name: 'Other', department_email: 'support@university.edu' },
    ];

    console.log('Seeding categories...');
    for (const category of categories) {
        await prisma.category.upsert({
            where: { name: category.name },
            update: {},
            create: category,
        });
    }
    console.log('Seeding finished.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
