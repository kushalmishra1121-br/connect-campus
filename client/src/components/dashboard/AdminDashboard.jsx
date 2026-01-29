import { useState, useEffect } from 'react';
import Navbar from '../layout/Navbar';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { Filter, Search, CheckCircle, Clock, AlertCircle, ChevronDown, Users, FileText } from 'lucide-react';
import { clsx } from "clsx";

const AdminDashboard = () => {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState('issues'); // 'issues' or 'users'

    // Issues State
    const [issues, setIssues] = useState([]);
    const [issuesLoading, setIssuesLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const [error, setError] = useState(null); // Add error state

    // Users State
    const [users, setUsers] = useState([]);
    const [usersLoading, setUsersLoading] = useState(false);

    // Fetch Issues
    const fetchIssues = async () => {
        try {
            setIssuesLoading(true);
            setError(null); // Clear previous errors
            const res = await api.get('/admin/issues' + (filter !== 'all' ? `?status=${filter}` : ''));
            console.log("Admin Issues Response:", res.data); // Log response
            setIssues(res.data.issues);
        } catch (error) {
            console.error("Failed to fetch admin issues", error);
            setError("Failed to load issues: " + (error.response?.data?.message || error.message)); // Set error message
        } finally {
            setIssuesLoading(false);
        }
    };

    // Fetch Users
    const fetchUsers = async () => {
        try {
            setUsersLoading(true);
            const res = await api.get('/admin/users');
            setUsers(res.data.users);
        } catch (error) {
            console.error("Failed to fetch users", error);
        } finally {
            setUsersLoading(false);
        }
    };

    useEffect(() => {
        if (activeTab === 'issues') fetchIssues();
        if (activeTab === 'users') fetchUsers();
    }, [activeTab, filter]);

    const handleStatusUpdate = async (id, newStatus) => {
        try {
            await api.patch(`/admin/issues/${id}/status`, { status: newStatus });
            fetchIssues(); // Refresh list
        } catch (error) {
            console.error("Failed to update status", error);
            alert("Failed to update status");
        }
    };

    return (
        <div className="min-h-screen bg-background font-sans relative overflow-hidden">
            {/* Background ambients */}
            <div className="absolute top-0 right-[-10%] w-[600px] h-[600px] bg-primary/10 rounded-full blur-[120px] pointer-events-none"></div>
            <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-secondary/10 rounded-full blur-[120px] pointer-events-none"></div>

            <Navbar />

            <main className="max-w-[1400px] mx-auto px-6 py-8 relative z-10">
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-white mb-2">Admin Dashboard</h1>
                        <p className="text-text-secondary">Manage issues and users</p>
                    </div>

                    {/* Tab Switcher */}
                    <div className="flex gap-2 bg-white/5 p-1 rounded-lg border border-white/10">
                        <button
                            onClick={() => setActiveTab('issues')}
                            className={clsx(
                                "px-4 py-2 rounded-md text-sm font-medium transition-all flex items-center gap-2",
                                activeTab === 'issues' ? "bg-primary text-white shadow-lg" : "text-text-secondary hover:text-white"
                            )}
                        >
                            <FileText size={16} /> Issues
                        </button>
                        <button
                            onClick={() => setActiveTab('users')}
                            className={clsx(
                                "px-4 py-2 rounded-md text-sm font-medium transition-all flex items-center gap-2",
                                activeTab === 'users' ? "bg-primary text-white shadow-lg" : "text-text-secondary hover:text-white"
                            )}
                        >
                            <Users size={16} /> Users
                        </button>
                    </div>
                </div>

                {activeTab === 'issues' ? (
                    <>
                        <div className="flex justify-end mb-4">
                            <div className="relative">
                                <select
                                    className="glass-input h-10 pl-4 pr-10 text-sm appearance-none cursor-pointer border-white/10"
                                    value={filter}
                                    onChange={(e) => setFilter(e.target.value)}
                                >
                                    <option value="all" className="bg-[#0f172a]">All Statuses</option>
                                    <option value="submitted" className="bg-[#0f172a]">Submitted</option>
                                    <option value="in_review" className="bg-[#0f172a]">In Review</option>
                                    <option value="in_progress" className="bg-[#0f172a]">In Progress</option>
                                    <option value="resolved" className="bg-[#0f172a]">Resolved</option>
                                </select>
                                <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-tertiary pointer-events-none" />
                            </div>
                        </div>

                        <div className="glass-panel rounded-2xl overflow-hidden border border-white/5">
                            <div className="overflow-x-auto custom-scrollbar">
                                <table className="w-full text-sm text-left text-text-secondary">
                                    <thead className="text-xs text-text-tertiary uppercase bg-white/5 border-b border-white/5">
                                        <tr>
                                            <th scope="col" className="px-6 py-4 font-semibold tracking-wider">Issue ID</th>
                                            <th scope="col" className="px-6 py-4 font-semibold tracking-wider">Title / Description</th>
                                            <th scope="col" className="px-6 py-4 font-semibold tracking-wider">Category</th>
                                            <th scope="col" className="px-6 py-4 font-semibold tracking-wider">Student</th>
                                            <th scope="col" className="px-6 py-4 font-semibold tracking-wider">Location</th>
                                            <th scope="col" className="px-6 py-4 font-semibold tracking-wider">Date</th>
                                            <th scope="col" className="px-6 py-4 font-semibold tracking-wider">Status</th>
                                            <th scope="col" className="px-6 py-4 font-semibold tracking-wider">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/5">
                                        {issuesLoading ? (
                                            <tr><td colSpan="8" className="p-8 text-center text-text-muted">Loading issues...</td></tr>
                                        ) : error ? (
                                            <tr><td colSpan="8" className="p-8 text-center text-status-error bg-status-error/10 font-medium">{error}</td></tr>
                                        ) : issues.length === 0 ? (
                                            <tr><td colSpan="8" className="p-8 text-center text-text-muted">No issues found.</td></tr>
                                        ) : (
                                            issues.map((issue) => (
                                                <tr key={issue.id} className="hover:bg-white/5 transition-colors group">
                                                    <td className="px-6 py-4 font-mono font-medium text-primary-light">#{issue.issue_number}</td>
                                                    <td className="px-6 py-4 max-w-xs">
                                                        <div className="font-semibold text-white mb-1 truncate group-hover:text-primary-light transition-colors">{issue.title}</div>
                                                        <div className="text-xs text-text-tertiary line-clamp-2">{issue.description}</div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <span className="inline-flex items-center px-2 py-1 rounded-md bg-white/5 border border-white/5 text-xs text-text-secondary">
                                                            {issue.category.name}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="font-medium text-white">{issue.creator.full_name}</div>
                                                        <div className="text-xs text-text-tertiary">{issue.creator.student_id}</div>
                                                    </td>
                                                    <td className="px-6 py-4 text-text-secondary">{issue.location}</td>
                                                    <td className="px-6 py-4 text-text-secondary">{new Date(issue.created_at).toLocaleDateString()}</td>
                                                    <td className="px-6 py-4">
                                                        <StatusBadge status={issue.status} />
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="relative">
                                                            <select
                                                                className="bg-[#0f172a] border border-white/10 text-white text-xs rounded-lg focus:ring-primary focus:border-primary block w-32 p-1.5 appearance-none cursor-pointer"
                                                                value={issue.status}
                                                                onChange={(e) => handleStatusUpdate(issue.id, e.target.value)}
                                                            >
                                                                <option value="submitted">Submitted</option>
                                                                <option value="in_review">In Review</option>
                                                                <option value="in_progress">In Progress</option>
                                                                <option value="resolved">Resolved</option>
                                                                <option value="closed">Closed</option>
                                                            </select>
                                                            <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-text-tertiary pointer-events-none" />
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="glass-panel rounded-2xl overflow-hidden border border-white/5">
                        <div className="overflow-x-auto custom-scrollbar">
                            <table className="w-full text-sm text-left text-text-secondary">
                                <thead className="text-xs text-text-tertiary uppercase bg-white/5 border-b border-white/5">
                                    <tr>
                                        <th scope="col" className="px-6 py-4 font-semibold tracking-wider">Student ID</th>
                                        <th scope="col" className="px-6 py-4 font-semibold tracking-wider">Full Name</th>
                                        <th scope="col" className="px-6 py-4 font-semibold tracking-wider">Email</th>
                                        <th scope="col" className="px-6 py-4 font-semibold tracking-wider">Role</th>
                                        <th scope="col" className="px-6 py-4 font-semibold tracking-wider">Status</th>
                                        <th scope="col" className="px-6 py-4 font-semibold tracking-wider">Joined At</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {usersLoading ? (
                                        <tr><td colSpan="6" className="p-8 text-center text-text-muted">Loading users...</td></tr>
                                    ) : users.length === 0 ? (
                                        <tr><td colSpan="6" className="p-8 text-center text-text-muted">No users found.</td></tr>
                                    ) : (
                                        users.map((u) => (
                                            <tr key={u.id} className="hover:bg-white/5 transition-colors">
                                                <td className="px-6 py-4 font-mono text-primary-light">{u.student_id}</td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 rounded-full bg-white/10 overflow-hidden">
                                                            {u.avatar_url ? (
                                                                <img src={u.avatar_url} alt="" className="w-full h-full object-cover" />
                                                            ) : (
                                                                <div className="w-full h-full flex items-center justify-center text-xs text-white">
                                                                    {u.full_name?.charAt(0) || '?'}
                                                                </div>
                                                            )}
                                                        </div>
                                                        <span className="font-medium text-white">{u.full_name}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">{u.email}</td>
                                                <td className="px-6 py-4 uppercase text-xs font-bold tracking-wider">{u.role}</td>
                                                <td className="px-6 py-4">
                                                    <span className={clsx(
                                                        "px-2 py-0.5 rounded-full text-xs font-medium border",
                                                        u.is_active
                                                            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                                                            : "bg-red-500/10 text-red-400 border-red-500/20"
                                                    )}>
                                                        {u.is_active ? 'Active' : 'Inactive'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-text-tertiary">{new Date(u.created_at).toLocaleDateString()}</td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

const StatusBadge = ({ status }) => {
    const styles = {
        submitted: "bg-blue-500/10 text-blue-400 border-blue-500/20",
        in_review: "bg-purple-500/10 text-purple-400 border-purple-500/20",
        in_progress: "bg-amber-500/10 text-amber-400 border-amber-500/20",
        resolved: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
        closed: "bg-gray-500/10 text-gray-400 border-gray-500/20",
    };

    const labels = {
        submitted: "Submitted",
        in_review: "In Review",
        in_progress: "In Progress",
        resolved: "Resolved",
        closed: "Closed"
    }

    return (
        <span className={clsx(
            "px-2.5 py-0.5 rounded-full text-xs font-medium border backdrop-blur-sm",
            styles[status] || styles.closed
        )}>
            {labels[status] || status}
        </span>
    );
};

export default AdminDashboard;
