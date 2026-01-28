const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const email = 'kushalmishra1121@gmail.com';
    console.log(`Promoting user ${email} to admin...`);
    try {
        const user = await prisma.user.update({
            where: { email },
            data: { role: 'admin' },
        });
        console.log(`Success! User ${user.email} is now an ${user.role}.`);
    } catch (e) {
        if (e.code === 'P2025') {
            console.error(`Error: User with email ${email} not found. Please register first.`);
        } else {
            console.error('Error promoting user:', e);
        }
    } finally {
        await prisma.$disconnect();
    }
}

main();
