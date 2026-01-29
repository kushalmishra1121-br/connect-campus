import { createContext, useState, useEffect, useContext } from 'react';
import api from '../services/api';
import { initiateSocketConnection, disconnectSocket, getSocket } from '../services/socket';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Check for existing token on mount
    useEffect(() => {
        const checkAuth = async () => {
            const token = localStorage.getItem('token');
            if (token) {
                try {
                    const res = await api.get('/auth/me');
                    setUser(res.data.user);

                    // Connect Socket
                    const socket = initiateSocketConnection(token);
                    socket.emit('join_user', res.data.user.id);
                } catch (error) {
                    console.error('Auth check failed', error);
                    localStorage.removeItem('token');
                    setUser(null);
                }
            }
            setLoading(false);
        };

        checkAuth();
    }, []);

    // Direct Backend Login
    const login = async (email, password) => {
        const res = await api.post('/auth/login', { email, password });
        const { token, user: userData } = res.data;

        localStorage.setItem('token', token);
        setUser(userData);

        // Connect Socket
        const socket = initiateSocketConnection(token);
        socket.emit('join_user', userData.id);

        return res.data;
    };

    // Direct Backend Register
    const register = async (userData) => {
        const res = await api.post('/auth/register', {
            email: userData.email,
            password: userData.password,
            full_name: userData.full_name,
            student_id: userData.student_id,
            role: userData.role || 'student',
            admin_secret: userData.admin_secret
        });

        const { token, user: newUser } = res.data;

        localStorage.setItem('token', token);
        setUser(newUser);

        // Connect Socket
        const socket = initiateSocketConnection(token);
        socket.emit('join_user', newUser.id);

        return res.data;
    };

    const logout = async () => {
        localStorage.removeItem('token');
        setUser(null);
        disconnectSocket();
    };

    // Demo Login - bypasses authentication for demo/testing
    // Uses real user IDs from database so issues can be created
    const demoLogin = (role = 'student') => {
        const demoUser = role === 'admin' ? {
            id: 3,
            email: 'kushalmishra11211@gmail.com',
            full_name: 'Admin User',
            role: 'admin',
            student_id: null
        } : {
            id: 1,
            email: 'kushalmishra1121@gmail.com',
            full_name: 'Demo Student',
            role: 'student',
            student_id: 'DEMO123'
        };

        localStorage.setItem('token', 'demo_token_' + role);
        setUser(demoUser);
        return { success: true, user: demoUser };
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, register, logout, demoLogin, getSocket }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
