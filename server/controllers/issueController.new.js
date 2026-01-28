exports.getIssueById = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;
        const userRole = req.user.role;

        const issue = await prisma.issue.findUnique({
            where: { id: parseInt(id) },
            include: {
                category: { select: { name: true } },
                updates: {
                    orderBy: { created_at: 'desc' }, // Recent first
                    include: {
                        user: { select: { full_name: true } }
                    }
                },
                attachments: true
            }
        });

        if (!issue) {
            return res.status(404).json({ success: false, message: 'Issue not found' });
        }

        // Access control: Admin or Creator
        if (userRole !== 'admin' && issue.created_by !== userId) {
            return res.status(403).json({ success: false, message: 'Access denied' });
        }

        res.json({ success: true, issue });
    } catch (error) {
        console.error('Get Issue By ID Error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
