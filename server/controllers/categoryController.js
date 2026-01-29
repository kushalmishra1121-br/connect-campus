const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Default categories for when database is empty or unavailable
const DEFAULT_CATEGORIES = [
    { id: 1, name: 'Infrastructure', description: 'Buildings, roads, facilities' },
    { id: 2, name: 'IT Services', description: 'WiFi, computers, software' },
    { id: 3, name: 'Hostel', description: 'Hostel related issues' },
    { id: 4, name: 'Academic', description: 'Classrooms, labs, library' },
    { id: 5, name: 'Cafeteria', description: 'Food and dining services' },
    { id: 6, name: 'Security', description: 'Safety and security concerns' },
    { id: 7, name: 'Other', description: 'Other issues' }
];

exports.getCategories = async (req, res) => {
    try {
        const categories = await prisma.category.findMany({
            where: { is_active: true },
            select: { id: true, name: true, description: true }
        });

        // If no categories in DB, return defaults
        if (categories.length === 0) {
            return res.json(DEFAULT_CATEGORIES);
        }

        res.json(categories);
    } catch (error) {
        console.error('Get Categories Error:', error);
        // Return default categories on error (DB not connected)
        res.json(DEFAULT_CATEGORIES);
    }
};
