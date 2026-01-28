import { useState, useEffect } from 'react';
import { Bell, Check, Info, AlertTriangle, XCircle, Trash2 } from 'lucide-react';
import { clsx } from "clsx";
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const NotificationsPopover = ({ isOpen, onClose }) => {
    const { getSocket } = useAuth();
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(false);

    const fetchNotifications = async () => {
        try {
            setLoading(true);
            const res = await api.get('/notifications');
            setNotifications(res.data.notifications);
            setUnreadCount(res.data.unreadCount);
        } catch (error) {
            console.error("Failed to fetch notifications", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (isOpen) {
            fetchNotifications();
        }
    }, [isOpen]);

    // Real-time listener
    useEffect(() => {
        const socket = getSocket();
        if (socket) {
            socket.on('notification', (data) => {
                // Determine if we should refresh based on isOpen or just increment counter
                // specific implementation depends on global state management, 
                // for local component we might not see it if closed, but Navbar handles the badge.
                // If open, we append.
                if (isOpen) {
                    setNotifications(prev => [
                        {
                            id: Date.now(), // temp id
                            title: 'New Notification',
                            message: data.message,
                            type: data.type || 'info',
                            is_read: false,
                            created_at: new Date().toISOString()
                        },
                        ...prev
                    ]);
                    // Mark as read immediately if valid logic, but usually user action required
                }
            });
        }
    }, [isOpen]);

    const markAsRead = async (id) => {
        try {
            await api.patch(`/notifications/${id}/read`);
            setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (error) {
            console.error("Failed to mark as read", error);
        }
    };

    const markAllRead = async () => {
        try {
            await api.patch(`/notifications/all/read`);
            setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
            setUnreadCount(0);
        } catch (error) {
            console.error("Failed to mark all as read", error);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="absolute right-0 top-16 w-80 sm:w-96 glass-panel rounded-xl shadow-2xl border border-white/10 overflow-hidden z-[100] animate-in slide-in-from-top-2 duration-200 origin-top-right">
            <div className="p-4 border-b border-white/10 flex items-center justify-between bg-[#020617]/50 backdrop-blur-md">
                <h3 className="font-bold text-white">Notifications</h3>
                {unreadCount > 0 && (
                    <button
                        onClick={markAllRead}
                        className="text-xs text-primary-light hover:text-white transition-colors flex items-center gap-1"
                    >
                        <Check size={12} /> Mark all read
                    </button>
                )}
            </div>

            <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
                {loading ? (
                    <div className="p-8 text-center text-text-muted text-xs">Loading...</div>
                ) : notifications.length === 0 ? (
                    <div className="p-8 text-center flex flex-col items-center justify-center text-text-muted">
                        <Bell size={32} className="mb-2 opacity-20" />
                        <p className="text-sm">No notifications</p>
                    </div>
                ) : (
                    <div className="divide-y divide-white/5">
                        {notifications.map((notif) => (
                            <div
                                key={notif.id}
                                onClick={() => !notif.is_read && markAsRead(notif.id)}
                                className={clsx(
                                    "p-4 hover:bg-white/5 transition-colors cursor-pointer relative group",
                                    !notif.is_read && "bg-primary/5"
                                )}
                            >
                                <div className="flex gap-3">
                                    <div className="mt-1">
                                        {notif.type === 'success' && <Check className="text-status-success" size={16} />}
                                        {notif.type === 'warning' && <AlertTriangle className="text-status-warning" size={16} />}
                                        {notif.type === 'error' && <XCircle className="text-status-error" size={16} />}
                                        {(!notif.type || notif.type === 'info') && <Info className="text-primary-light" size={16} />}
                                    </div>
                                    <div className="flex-1">
                                        <p className={clsx("text-sm text-white mb-1", !notif.is_read && "font-semibold")}>
                                            {notif.title || 'Notification'}
                                        </p>
                                        <p className="text-xs text-text-secondary leading-relaxed">
                                            {notif.message}
                                        </p>
                                        <p className="text-[10px] text-text-tertiary mt-2">
                                            {new Date(notif.created_at).toLocaleString()}
                                        </p>
                                    </div>
                                    {!notif.is_read && (
                                        <div className="w-2 h-2 rounded-full bg-primary mt-2"></div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default NotificationsPopover;
