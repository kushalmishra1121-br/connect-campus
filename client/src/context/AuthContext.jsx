import { createContext, useState, useEffect, useContext } from 'react';
import {
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    GoogleAuthProvider,
    signInWithPopup
} from 'firebase/auth';
import { auth } from '../services/firebase';
import api from '../services/api';
import { initiateSocketConnection, disconnectSocket, getSocket } from '../services/socket';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Listen to Firebase auth state changes
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            if (firebaseUser) {
                try {
                    // Get Firebase ID token
                    const idToken = await firebaseUser.getIdToken();
                    localStorage.setItem('token', idToken);

                    // Sync with backend to get full user profile
                    const res = await api.get('/auth/me');
                    setUser(res.data.user);

                    // Connect Socket
                    const socket = initiateSocketConnection(idToken);
                    socket.emit('join_user', res.data.user.id);
                } catch (error) {
                    console.error('Failed to sync user with backend', error);
                    // User exists in Firebase but not in our backend - create them
                    if (error.response?.status === 401 || error.response?.status === 404) {
                        // First time Firebase user - they need to register through our flow
                        setUser(null);
                    }
                }
            } else {
                setUser(null);
                localStorage.removeItem('token');
                disconnectSocket();
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    // Firebase Email/Password Login
    const login = async (email, password) => {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const idToken = await userCredential.user.getIdToken();
        localStorage.setItem('token', idToken);

        // Sync with backend
        const res = await api.post('/auth/firebase-login', {
            firebase_uid: userCredential.user.uid,
            email: userCredential.user.email
        });
        setUser(res.data.user);

        // Connect Socket
        const socket = initiateSocketConnection(idToken);
        socket.emit('join_user', res.data.user.id);

        return res.data;
    };

    // Firebase Email/Password Register
    const register = async (userData) => {
        // Create Firebase user first
        const userCredential = await createUserWithEmailAndPassword(auth, userData.email, userData.password);
        const idToken = await userCredential.user.getIdToken();
        localStorage.setItem('token', idToken);

        // Then create in our backend with additional info
        const res = await api.post('/auth/firebase-register', {
            firebase_uid: userCredential.user.uid,
            email: userData.email,
            full_name: userData.full_name,
            student_id: userData.student_id,
            role: userData.role,
            admin_secret: userData.admin_secret
        });
        setUser(res.data.user);

        // Connect Socket
        const socket = initiateSocketConnection(idToken);
        socket.emit('join_user', res.data.user.id);

        return res.data;
    };

    // Google Sign In
    const loginWithGoogle = async () => {
        const provider = new GoogleAuthProvider();
        const userCredential = await signInWithPopup(auth, provider);
        const idToken = await userCredential.user.getIdToken();
        localStorage.setItem('token', idToken);

        // Sync/Create with backend
        const res = await api.post('/auth/firebase-login', {
            firebase_uid: userCredential.user.uid,
            email: userCredential.user.email,
            full_name: userCredential.user.displayName
        });
        setUser(res.data.user);

        // Connect Socket
        const socket = initiateSocketConnection(idToken);
        socket.emit('join_user', res.data.user.id);

        return res.data;
    };

    const logout = async () => {
        await signOut(auth);
        localStorage.removeItem('token');
        setUser(null);
        disconnectSocket();
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, register, logout, loginWithGoogle, getSocket }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
