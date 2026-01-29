const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Helper to generate JWT
const generateToken = (userId) => {
    return jwt.sign({ userId }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN || '7d'
    });
};

exports.register = async (req, res) => {
    try {
        const { email, password, full_name, student_id, role = 'student' } = req.body;

        // Validate input
        if (!email || !password || !full_name) {
            return res.status(400).json({ success: false, message: 'Missing required fields' });
        }

        // Security check for Admin registration
        if (role === 'admin') {
            const secretKey = req.body.admin_secret;
            if (secretKey !== process.env.ADMIN_SECRET) {
                return res.status(403).json({ success: false, message: 'Invalid Admin Secret Key' });
            }
        }

        // Check if student_id exists (if provided)
        if (student_id) {
            const existingStudentId = await prisma.user.findUnique({ where: { student_id } });
            if (existingStudentId) {
                return res.status(400).json({ success: false, message: 'Student ID already registered' });
            }
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const password_hash = await bcrypt.hash(password, salt);

        // Create user
        const user = await prisma.user.create({
            data: {
                email,
                password_hash,
                full_name,
                student_id,
                role,
            }
        });

        // Generate token
        const token = generateToken(user.id);

        res.status(201).json({
            success: true,
            user: {
                id: user.id,
                email: user.email,
                full_name: user.full_name,
                role: user.role,
                student_id: user.student_id
            },
            token
        });

    } catch (error) {
        console.error('Register Error:', error);

        // Handle Prisma Unique Constraint Error
        if (error.code === 'P2002') {
            const field = error.meta?.target?.[0];
            return res.status(400).json({
                success: false,
                message: `${field ? field.replace('_', ' ') : 'Field'} already exists`
            });
        }

        res.status(500).json({ success: false, message: 'Server error during registration' });
    }
};

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ success: false, message: 'Please provide email and password' });
        }

        // Check user
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }

        // Check password
        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) {
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }

        // Generate token
        const token = generateToken(user.id);

        res.json({
            success: true,
            user: {
                id: user.id,
                email: user.email,
                full_name: user.full_name,
                role: user.role,
                student_id: user.student_id,
                avatar_url: user.avatar_url
            },
            token
        });

    } catch (error) {
        console.error('Login Error:', error);
        res.status(500).json({ success: false, message: 'Server error during login' });
    }
};

exports.getMe = async (req, res) => {
    try {
        const user = req.user;
        res.json({
            success: true,
            user: {
                id: user.id,
                email: user.email,
                full_name: user.full_name,
                role: user.role,
                student_id: user.student_id,
                avatar_url: user.avatar_url,
                created_at: user.created_at
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

const crypto = require('crypto');
const emailService = require('../utils/emailService');

exports.forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        const user = await prisma.user.findUnique({ where: { email } });

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        // Generate 6-digit code
        const resetCode = Math.floor(100000 + Math.random() * 900000).toString();

        // Hash code for storage
        const resetTokenHash = crypto.createHash('sha256').update(resetCode).digest('hex');

        // Expires in 10 minutes
        const resetTokenExpires = new Date(Date.now() + 10 * 60 * 1000);

        await prisma.user.update({
            where: { id: user.id },
            data: {
                reset_token: resetTokenHash,
                reset_token_expires: resetTokenExpires
            }
        });

        // Send Email
        const message = `
            <h1>Password Reset Request</h1>
            <p>You requested a password reset. Your verification code is:</p>
            <h2 style="color: #4F46E5; letter-spacing: 5px;">${resetCode}</h2>
            <p>This code will expire in 10 minutes.</p>
            <p>If you did not request this, please ignore this email.</p>
        `;

        await emailService.sendEmail({
            to: user.email,
            subject: 'Password Reset Code - STITCH Test',
            html: message
        });

        res.json({ success: true, message: 'Reset code sent to email' });

    } catch (error) {
        console.error('Forgot Password Error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

exports.resetPassword = async (req, res) => {
    try {
        const { email, code, newPassword } = req.body;

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user || !user.reset_token || !user.reset_token_expires) {
            return res.status(400).json({ success: false, message: 'Invalid request or expired token' });
        }

        // Verify Expiry
        if (new Date() > user.reset_token_expires) {
            return res.status(400).json({ success: false, message: 'Code expired' });
        }

        // Verify Code
        const resetTokenHash = crypto.createHash('sha256').update(code).digest('hex');
        if (resetTokenHash !== user.reset_token) {
            return res.status(400).json({ success: false, message: 'Invalid verification code' });
        }

        // Hash new password
        const salt = await bcrypt.genSalt(10);
        const password_hash = await bcrypt.hash(newPassword, salt);

        // Update User
        await prisma.user.update({
            where: { id: user.id },
            data: {
                password_hash: password_hash,
                reset_token: null,
                reset_token_expires: null
            }
        });

        res.json({ success: true, message: 'Password reset successfully' });

    } catch (error) {
        console.error('Reset Password Error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// Firebase Login - Sync Firebase user with our database
exports.firebaseLogin = async (req, res) => {
    try {
        const { firebase_uid, email, full_name } = req.body;

        if (!firebase_uid || !email) {
            return res.status(400).json({ success: false, message: 'Missing Firebase credentials' });
        }

        // Try to find existing user by firebase_uid or email
        let user = await prisma.user.findFirst({
            where: {
                OR: [
                    { firebase_uid },
                    { email }
                ]
            }
        });

        if (user) {
            // Update firebase_uid if not set
            if (!user.firebase_uid) {
                user = await prisma.user.update({
                    where: { id: user.id },
                    data: { firebase_uid }
                });
            }

            const token = generateToken(user.id);
            return res.json({
                success: true,
                user: {
                    id: user.id,
                    email: user.email,
                    full_name: user.full_name,
                    role: user.role,
                    student_id: user.student_id,
                    avatar_url: user.avatar_url
                },
                token
            });
        }

        // User doesn't exist - create new one (for Google Sign-In)
        if (full_name) {
            user = await prisma.user.create({
                data: {
                    firebase_uid,
                    email,
                    full_name,
                    password_hash: 'firebase_auth', // Placeholder since Firebase handles auth
                    role: 'student'
                }
            });

            const token = generateToken(user.id);
            return res.json({
                success: true,
                user: {
                    id: user.id,
                    email: user.email,
                    full_name: user.full_name,
                    role: user.role,
                    student_id: user.student_id
                },
                token
            });
        }

        return res.status(404).json({ success: false, message: 'User not found. Please register first.' });

    } catch (error) {
        console.error('Firebase Login Error:', error);
        res.status(500).json({ success: false, message: 'Server error during Firebase login' });
    }
};

// Firebase Register - Create user in our database after Firebase signup
exports.firebaseRegister = async (req, res) => {
    try {
        const { firebase_uid, email, full_name, student_id, role = 'student', admin_secret } = req.body;

        if (!firebase_uid || !email || !full_name) {
            return res.status(400).json({ success: false, message: 'Missing required fields' });
        }

        // Security check for Admin registration
        if (role === 'admin') {
            if (admin_secret !== process.env.ADMIN_SECRET) {
                return res.status(403).json({ success: false, message: 'Invalid Admin Secret Key' });
            }
        }

        // Check if student_id exists (if provided)
        if (student_id) {
            const existingStudentId = await prisma.user.findUnique({ where: { student_id } });
            if (existingStudentId) {
                return res.status(400).json({ success: false, message: 'Student ID already registered' });
            }
        }

        // Check if user already exists
        const existingUser = await prisma.user.findFirst({
            where: {
                OR: [
                    { firebase_uid },
                    { email }
                ]
            }
        });

        if (existingUser) {
            return res.status(400).json({ success: false, message: 'User already exists' });
        }

        // Create user
        const user = await prisma.user.create({
            data: {
                firebase_uid,
                email,
                full_name,
                student_id,
                role,
                password_hash: 'firebase_auth' // Placeholder
            }
        });

        const token = generateToken(user.id);

        res.status(201).json({
            success: true,
            user: {
                id: user.id,
                email: user.email,
                full_name: user.full_name,
                role: user.role,
                student_id: user.student_id
            },
            token
        });

    } catch (error) {
        console.error('Firebase Register Error:', error);

        if (error.code === 'P2002') {
            const field = error.meta?.target?.[0];
            return res.status(400).json({
                success: false,
                message: `${field ? field.replace('_', ' ') : 'Field'} already exists`
            });
        }

        res.status(500).json({ success: false, message: 'Server error during registration' });
    }
};
