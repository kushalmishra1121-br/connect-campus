const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.getAnalytics = async (req, res) => {
    try {
        // Only admins can view analytics
        if (req.user.role !== 'admin') {
            return res.status(403).json({ success: false, message: 'Access denied' });
        }

        // 1. Counts by Status
        const statusCounts = await prisma.issue.groupBy({
            by: ['status'],
            _count: {
                id: true,
            },
        });

        // 2. Counts by Category
        const categoryCounts = await prisma.issue.groupBy({
            by: ['category_id'],
            _count: {
                id: true,
            },
            orderBy: {
                _count: {
                    id: 'desc'
                }
            }
        });

        // Enhance category data with names
        const enrichedCategoryCounts = await Promise.all(categoryCounts.map(async (item) => {
            const category = await prisma.category.findUnique({
                where: { id: item.category_id },
                select: { name: true }
            });
            return {
                name: category ? category.name : 'Unknown',
                count: item._count.id
            };
        }));

        // 3. Recent Issues (Last 5)
        const recentIssues = await prisma.issue.findMany({
            take: 5,
            orderBy: { created_at: 'desc' },
            select: {
                id: true,
                issue_number: true,
                title: true,
                status: true,
                created_at: true,
                creator: { select: { full_name: true } }
            }
        });

        // 4. Total Issues
        const totalIssues = await prisma.issue.count();

        // 5. Monthly Trends (Simplified for MVP: just get all dates and process on frontend or simple grouping)
        // For MVP, let's just return the raw stats above.

        res.json({
            success: true,
            stats: {
                total: totalIssues,
                byStatus: statusCounts.reduce((acc, curr) => ({ ...acc, [curr.status]: curr._count.id }), {}),
                byCategory: enrichedCategoryCounts,
                recent: recentIssues
            }
        });

    } catch (error) {
        console.error('Analytics Error:', error);
        res.status(500).json({ success: false, message: 'Server error fetching analytics' });
    }
};
