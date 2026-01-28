const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.updateProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        const { full_name, avatar_url } = req.body;

        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: {
                full_name,
                avatar_url
            },
            select: {
                id: true,
                full_name: true,
                email: true,
                student_id: true,
                role: true,
                avatar_url: true,
                is_active: true
            }
        });

        res.json({ success: true, user: updatedUser });
    } catch (error) {
        console.error('Update Profile Error:', error);
        res.status(500).json({ success: false, message: 'Server error updating profile' });
    }
};

exports.getAllUsers = async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ success: false, message: 'Access denied' });
        }

        const users = await prisma.user.findMany({
            select: {
                id: true,
                full_name: true,
                email: true,
                student_id: true,
                role: true,
                avatar_url: true,
                is_active: true,
                created_at: true
            },
            orderBy: { created_at: 'desc' }
        });

        res.json({ success: true, users });
    } catch (error) {
        console.error('Get All Users Error:', error);
        res.status(500).json({ success: false, message: 'Server error fetching users' });
    }
};
