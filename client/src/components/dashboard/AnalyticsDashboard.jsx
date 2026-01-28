import { useState, useEffect } from 'react';
import Navbar from '../layout/Navbar';
import api from '../../services/api';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    PieChart, Pie, Cell
} from 'recharts';
import { Activity, Users, CheckCircle, Clock } from 'lucide-react';

const AnalyticsDashboard = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAnalytics = async () => {
            try {
                const res = await api.get('/admin/analytics');
                setStats(res.data.stats);
            } catch (error) {
                console.error("Failed to fetch analytics", error);
            } finally {
                setLoading(false);
            }
        };

        fetchAnalytics();
    }, []);

    if (loading) return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
    );

    if (!stats) return <div className="p-10 text-center text-text-tertiary">Failed to load data.</div>;

    // Prepare chart data
    const statusData = [
        { name: 'Submitted', count: stats.byStatus.submitted || 0 },
        { name: 'In Review', count: stats.byStatus.in_review || 0 },
        { name: 'In Progress', count: stats.byStatus.in_progress || 0 },
        { name: 'Resolved', count: stats.byStatus.resolved || 0 },
    ];

    const categoryData = stats.byCategory;
    const COLORS = ['#6366f1', '#a855f7', '#f59e0b', '#10b981', '#ef4444'];

    return (
        <div className="min-h-screen bg-background font-sans relative overflow-hidden">
            {/* Background ambients */}
            <div className="absolute top-0 right-[-10%] w-[600px] h-[600px] bg-primary/10 rounded-full blur-[120px] pointer-events-none"></div>
            <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-secondary/10 rounded-full blur-[120px] pointer-events-none"></div>

            <Navbar />

            <main className="max-w-[1400px] mx-auto px-6 py-8 relative z-10">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-white mb-2">Analytics Overview</h1>
                    <p className="text-text-secondary">Insights into reported issues</p>
                </div>

                {/* KPI Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <StatCard
                        icon={<Activity size={24} />}
                        value={stats.total}
                        label="Total Issues"
                        color="bg-primary/20 text-primary-light"
                    />
                    <StatCard
                        icon={<Clock size={24} />}
                        value={stats.byStatus.in_progress || 0}
                        label="In Progress"
                        color="bg-status-warning/20 text-status-warning"
                    />
                    <StatCard
                        icon={<CheckCircle size={24} />}
                        value={stats.byStatus.resolved || 0}
                        label="Resolved"
                        color="bg-status-success/20 text-status-success"
                    />
                    <StatCard
                        icon={<Users size={24} />}
                        value="12" // Demo data
                        label="Active Students"
                        color="bg-secondary/20 text-secondary-light"
                    />
                </div>

                {/* Charts */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                    <div className="glass-panel rounded-2xl p-6 border border-white/5">
                        <h3 className="text-lg font-bold text-white mb-6">Issues by Category</h3>
                        <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={categoryData}
                                        cx="50%"
                                        cy="50%"
                                        outerRadius={80}
                                        fill="#8884d8"
                                        dataKey="count"
                                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                    >
                                        {categoryData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px', color: '#f8fafc' }}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    <div className="glass-panel rounded-2xl p-6 border border-white/5">
                        <h3 className="text-lg font-bold text-white mb-6">Issues by Status</h3>
                        <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={statusData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
                                    <XAxis dataKey="name" stroke="#94a3b8" />
                                    <YAxis allowDecimals={false} stroke="#94a3b8" />
                                    <Tooltip
                                        cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                                        contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px', color: '#f8fafc' }}
                                    />
                                    <Bar dataKey="count" fill="#6366f1" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

const StatCard = ({ icon, value, label, color }) => (
    <div className="glass-panel p-6 rounded-2xl border border-white/5 flex items-center gap-4 hover:bg-white/5 transition-colors">
        <div className={`p-3 rounded-xl ${color}`}>
            {icon}
        </div>
        <div>
            <div className="text-2xl font-bold text-white">{value}</div>
            <div className="text-sm text-text-tertiary">{label}</div>
        </div>
    </div>
);

export default AnalyticsDashboard;
