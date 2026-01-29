const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const requireAuth = async (req, res, next) => {
    try {
        // 1. Extract token from header
        const token = req.headers.authorization?.replace('Bearer ', '');

        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'No authentication token provided'
            });
        }

        // Handle demo tokens for testing
        if (token === 'demo_token_student') {
            req.user = { id: 1, email: 'kushalmishra1121@gmail.com', role: 'student', is_active: true };
            return next();
        }
        if (token === 'demo_token_admin') {
            req.user = { id: 3, email: 'kushalmishra11211@gmail.com', role: 'admin', is_active: true };
            return next();
        }

        // 2. Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // 3. Get user from database
        const user = await prisma.user.findUnique({
            where: { id: decoded.userId }
        });

        if (!user || !user.is_active) {
            return res.status(401).json({
                success: false,
                message: 'Invalid or expired token'
            });
        }

        // 4. Attach user to request
        req.user = user;
        next();

    } catch (error) {
        console.error('Auth Error:', error);
        return res.status(401).json({
            success: false,
            message: 'Authentication failed'
        });
    }
};

module.exports = requireAuth;
