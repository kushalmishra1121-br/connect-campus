import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { GraduationCap, Bell, LogOut, User, Menu } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import NotificationsPopover from './NotificationsPopover';
import api from '../../services/api';

const Navbar = () => {
    const { user, logout, getSocket } = useAuth();
    const navigate = useNavigate();
    const [showNotifications, setShowNotifications] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);
    const notificationRef = useRef(null);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    // Close popover when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (notificationRef.current && !notificationRef.current.contains(event.target)) {
                setShowNotifications(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Initial fetch for badge count
    useEffect(() => {
        const fetchUnreadCount = async () => {
            try {
                const res = await api.get('/notifications?limit=1');
                setUnreadCount(res.data.unreadCount);
            } catch (error) {
                console.error("Failed to fetch notification count", error);
            }
        };
        fetchUnreadCount();

        // Socket listener for new notifications updates the badge
        const socket = getSocket();
        if (socket) {
            socket.on('notification', () => {
                setUnreadCount(prev => prev + 1);
            });
        }

        return () => {
            if (socket) socket.off('notification');
        };
    }, []);

    return (
        <nav className="h-16 sticky top-0 px-6 z-50 flex items-center justify-between bg-background/80 backdrop-blur-md border-b border-border/50">
            {/* Left Section */}
            <div className="flex items-center gap-3">
                <div className="bg-gradient-to-br from-primary to-primary-light p-2 rounded-lg shadow-lg shadow-primary/20">
                    <GraduationCap size={24} className="text-white" />
                </div>
                <h1 className="text-lg font-bold text-white tracking-tight hidden sm:block">Student Support Portal</h1>
            </div>

            {/* Right Section */}
            <div className="flex items-center gap-4">
                {/* Notification Bell */}
                <div className="relative" ref={notificationRef}>
                    <button
                        onClick={() => setShowNotifications(!showNotifications)}
                        className="relative p-2 hover:bg-white/5 rounded-full transition-colors text-text-secondary hover:text-white group"
                    >
                        <Bell size={20} />
                        {unreadCount > 0 && (
                            <span className="absolute top-2 right-2 w-2 h-2 bg-status-error rounded-full ring-2 ring-background group-hover:scale-110 transition-transform"></span>
                        )}
                    </button>

                    <NotificationsPopover
                        isOpen={showNotifications}
                        onClose={() => setShowNotifications(false)}
                    />
                </div>

                {/* User Profile */}
                <div className="flex items-center gap-3 pl-4 border-l border-white/10">
                    <div
                        className="flex items-center gap-3 cursor-pointer group"
                        onClick={() => navigate('/profile')}
                    >
                        <div className="text-right hidden sm:block">
                            <p className="text-sm font-semibold text-white group-hover:text-primary-light transition-colors">{user?.full_name || 'Student'}</p>
                            <p className="text-xs text-text-tertiary">ID: {user?.student_id || 'N/A'}</p>
                        </div>
                        <div className="w-10 h-10 rounded-full border border-white/10 bg-white/5 flex items-center justify-center overflow-hidden shadow-inner group-hover:border-primary/50 transition-colors">
                            {user?.avatar_url ? (
                                <img src={user.avatar_url} alt="Profile" className="w-full h-full object-cover" />
                            ) : (
                                <User size={20} className="text-text-tertiary" />
                            )}
                        </div>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="ml-2 p-2 hover:bg-status-error/10 text-text-secondary hover:text-status-error rounded-full transition-colors"
                        title="Logout"
                    >
                        <LogOut size={18} />
                    </button>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
