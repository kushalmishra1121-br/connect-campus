const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { sendEmail } = require('../utils/emailService');

// Helper to generate next issue number (e.g., 4022)
// For simplicity in MVP, we can use the ID or a simple increment strategy.
// In a real high-concurrency app, this needs a more robust solution (e.g., sequence table).
const getNextIssueNumber = async () => {
    const lastIssue = await prisma.issue.findFirst({
        orderBy: { id: 'desc' }
    });
    // Start from 4000 if no issues exist
    const lastNum = lastIssue ? parseInt(lastIssue.issue_number) : 4000;
    return (lastNum + 1).toString();
};

exports.createIssue = async (req, res) => {
    try {
        const { title, description, location, category_id, priority = 'medium', image_url } = req.body;
        const userId = req.user.id;

        // Validate
        if (!title || !description || !location || !category_id) {
            return res.status(400).json({ success: false, message: 'Please fill all required fields' });
        }

        const issueNumber = await getNextIssueNumber();

        const issue = await prisma.issue.create({
            data: {
                issue_number: issueNumber,
                title,
                description,
                location,
                priority,
                category: { connect: { id: parseInt(category_id) } },
                creator: { connect: { id: userId } },
                // Initially submitted, update helps track this
                status: 'submitted',
                attachments: image_url ? {
                    create: {
                        file_url: image_url,
                        mime_type: 'image/jpeg', // Defaulting since we don't have this info from frontend yet
                        file_name: 'issue_image.jpg',
                        file_size: 0, // Defaulting as placeholder
                        uploader: { connect: { id: userId } }
                    }
                } : undefined
            }
        });

        // Create initial update entry
        await prisma.issueUpdate.create({
            data: {
                issue_id: issue.id,
                new_status: 'submitted',
                comment: 'Issue reported',
                updated_by: userId
            }
        });

        // Send Email to Admin (Mocking Admin Email)
        // In real app, fetch admins or category head
        await sendEmail({
            to: 'kushalmishra1121@gmail.com', // Using the admin email provided by user
            subject: `New Issue Reported: ${title}`,
            html: `
                <h3>New Issue Reported</h3>
                <p><strong>Title:</strong> ${title}</p>
                <p><strong>Category:</strong> ${issue.category_id}</p>
                <p><strong>Location:</strong> ${location}</p>
                <p><strong>Description:</strong> ${description}</p>
                <br>
                <a href="${process.env.CLIENT_URL || 'http://localhost:5173'}/admin">View Dashboard</a>
            `
        });

        res.status(201).json({ success: true, issue });

    } catch (error) {
        console.error('Create Issue Error:', error);
        res.status(500).json({ success: false, message: 'Server error creating issue' });
    }
};

exports.getIssues = async (req, res) => {
    try {
        const userId = req.user.id;
        const { status, limit } = req.query;

        const where = { created_by: userId };
        if (status) {
            if (status === 'active') { // Custom filter for non-closed/resolved
                where.status = { notIn: ['closed', 'resolved'] };
            } else {
                where.status = status;
            }
        }

        const issues = await prisma.issue.findMany({
            where,
            orderBy: { created_at: 'desc' },
            take: limit ? parseInt(limit) : undefined,
            include: {
                category: { select: { name: true } }
            }
        });

        res.json({ success: true, issues });
    } catch (error) {
        console.error('Get Issues Error:', error);
        res.status(500).json({ success: false, message: 'Server error fetching issues' });
    }
};

exports.getAllIssues = async (req, res) => {
    try {
        // Ensure user is admin (simple check, better done in middleware)
        if (req.user.role !== 'admin') {
            return res.status(403).json({ success: false, message: 'Access denied' });
        }

        const { status, limit } = req.query;
        const where = {};

        if (status && status !== 'all') {
            where.status = status;
        }

        const issues = await prisma.issue.findMany({
            where,
            orderBy: { created_at: 'desc' },
            take: limit ? parseInt(limit) : undefined,
            include: {
                category: { select: { name: true } },
                creator: { select: { full_name: true, email: true, student_id: true } }
            }
        });

        res.json({ success: true, issues });
    } catch (error) {
        console.error('Get All Issues Error:', error);
        res.status(500).json({ success: false, message: 'Server error fetching issues' });
    }
};

exports.updateIssueStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, comment } = req.body;
        const userId = req.user.id;

        if (req.user.role !== 'admin') {
            return res.status(403).json({ success: false, message: 'Access denied' });
        }

        const validStatuses = ['submitted', 'in_review', 'in_progress', 'resolved', 'closed'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ success: false, message: 'Invalid status' });
        }

        // Update issue
        const issue = await prisma.issue.update({
            where: { id: parseInt(id) },
            data: { status }
        });

        // Add history record
        await prisma.issueUpdate.create({
            data: {
                issue_id: parseInt(id),
                new_status: status,
                comment: comment || `Status updated to ${status}`,
                updated_by: userId
            }
        });

        // Notify Student via Email
        const student = await prisma.user.findUnique({ where: { id: issue.created_by } });
        if (student) {
            // 1. Send Email
            await sendEmail({
                to: student.email,
                subject: `Issue #${issue.issue_number} Status Updated: ${status}`,
                html: `
                    <h3>Issue Status Update</h3>
                    <p>Your issue <strong>${issue.title}</strong> has been updated.</p>
                    <p><strong>New Status:</strong> ${status}</p>
                    <p><strong>Comment:</strong> ${comment || 'No additional comments.'}</p>
                    <br>
                    <a href="${process.env.CLIENT_URL || 'http://localhost:5173'}/dashboard">View Dashboard</a>
                `
            });

            // 2. Real-time Notification
            const io = req.app.get('io');
            if (io) {
                io.to(`user_${student.id}`).emit('issue_updated', {
                    issue_id: issue.id,
                    new_status: status,
                    comment: comment
                });

                // Also emit a generic notification event for the bell icon
                io.to(`user_${student.id}`).emit('notification', {
                    type: 'info',
                    message: `Issue "${issue.title}" is now ${status}`
                });
            }

            // 3. Create Database Notification
            await prisma.notification.create({
                data: {
                    user_id: student.id,
                    issue_id: issue.id,
                    type: 'info',
                    title: 'Issue Updated',
                    message: `Your issue "${issue.title}" has been updated to ${status}.`,
                    is_read: false
                }
            });
        }

        res.json({ success: true, issue });

    } catch (error) {
        console.error('Update Status Error:', error);
        res.status(500).json({ success: false, message: 'Server error updating status' });
    }
};

exports.getIssueById = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        const issue = await prisma.issue.findUnique({
            where: { id: parseInt(id) },
            include: {
                category: true,
                updates: {
                    orderBy: { created_at: 'desc' }
                },
                creator: {
                    select: {
                        id: true,
                        full_name: true,
                        student_id: true,
                        email: true
                    }
                },
                attachments: true
            }
        });

        if (!issue) {
            return res.status(404).json({ success: false, message: 'Issue not found' });
        }

        // Authorization: Admin or Creator
        if (req.user.role !== 'admin' && issue.creator_id !== userId) {
            return res.status(403).json({ success: false, message: 'Access denied' });
        }

        res.json({ success: true, issue });
    } catch (error) {
        console.error('Get Issue By ID Error:', error);
        res.status(500).json({ success: false, message: 'Server error fetching issue details' });
    }
};
