const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const dotenv = require('dotenv');
const { PrismaClient } = require('@prisma/client');

// Load environment variables
dotenv.config();

const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: process.env.CLIENT_URL || 'http://localhost:5173',
        methods: ["GET", "POST", "PATCH"],
        credentials: true
    }
});

// Make io accessible globally or pass it to routes
app.set('io', io);

io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    socket.on('join_user', (userId) => {
        socket.join(`user_${userId}`);
        console.log(`User ${userId} joined room user_${userId}`);
    });

    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
    });
});

const prisma = new PrismaClient();
const PORT = process.env.PORT || 5000;

// Routes
const authRoutes = require('./routes/auth');
const apiRoutes = require('./routes/api');

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static('uploads')); // Serve uploaded files
app.use(cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true
}));
app.use(helmet());
app.use(morgan('dev'));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api', apiRoutes);

// Test Route
app.get('/', (req, res) => {
    res.json({ message: 'STITCH API is running' });
});

// Database Connection Check
app.get('/api/health', async (req, res) => {
    try {
        await prisma.$queryRaw`SELECT 1`;
        res.json({ status: 'ok', database: 'connected' });
    } catch (error) {
        res.status(500).json({ status: 'error', database: 'disconnected', error: error.message });
    }
});

// Start Server
process.on('exit', (code) => console.log('Process exit', code));
process.on('uncaughtException', (err) => console.error('Uncaught Exception:', err));
process.on('unhandledRejection', (reason, p) => console.error('Unhandled Rejection:', reason));

server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
        console.error(`Port ${PORT} already in use. Stop the process using it or set a different PORT.`);
        process.exit(1);
    }
    console.error(err);
});

server.on('listening', () => {
    const addr = server.address();
    console.log(`Listening on ${addr.address}:${addr.port}`);
});

server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`API URL: http://localhost:${PORT}`);
    console.log('STITCH API is running');
});

module.exports = app;
