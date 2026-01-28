const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.getNotifications = async (req, res) => {
    try {
        const userId = req.user.id;
        const { limit = 10 } = req.query;

        const notifications = await prisma.notification.findMany({
            where: { user_id: userId },
            orderBy: { created_at: 'desc' },
            take: parseInt(limit)
        });

        // Get unread count
        const unreadCount = await prisma.notification.count({
            where: {
                user_id: userId,
                is_read: false
            }
        });

        res.json({ success: true, notifications, unreadCount });
    } catch (error) {
        console.error('Get Notifications Error:', error);
        res.status(500).json({ success: false, message: 'Server error fetching notifications' });
    }
};

exports.markAsRead = async (req, res) => {
    try {
        const userId = req.user.id;
        const { id } = req.params;

        // Mark specific notification or all
        if (id === 'all') {
            await prisma.notification.updateMany({
                where: { user_id: userId, is_read: false },
                data: { is_read: true }
            });
        } else {
            await prisma.notification.update({
                where: {
                    id: parseInt(id),
                    user_id: userId
                },
                data: { is_read: true }
            });
        }

        res.json({ success: true, message: 'Notifications marked as read' });
    } catch (error) {
        console.error('Mark Read Error:', error);
        res.status(500).json({ success: false, message: 'Server error updating notifications' });
    }
};
